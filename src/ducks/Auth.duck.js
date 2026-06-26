import isEmpty from 'lodash/isEmpty';
import { clearCurrentUser, fetchCurrentUser } from './user.duck';
import { createUserFromAPI, createUserWithIdp } from '../util/api';
import { storableError } from '../util/errors';
import * as log from '../util/log';

const authenticated = authInfo => authInfo && authInfo.isAnonymous === false;

// ================ Action types ================ //

export const AUTH_INFO_REQUEST = 'app/Auth/AUTH_INFO_REQUEST';
export const AUTH_INFO_SUCCESS = 'app/Auth/AUTH_INFO_SUCCESS';

export const LOGIN_REQUEST = 'app/Auth/LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'app/Auth/LOGIN_SUCCESS';
export const LOGIN_ERROR = 'app/Auth/LOGIN_ERROR';

export const LOGOUT_REQUEST = 'app/Auth/LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'app/Auth/LOGOUT_SUCCESS';
export const LOGOUT_ERROR = 'app/Auth/LOGOUT_ERROR';

export const SIGNUP_REQUEST = 'app/Auth/SIGNUP_REQUEST';
export const SIGNUP_SUCCESS = 'app/Auth/SIGNUP_SUCCESS';
export const SIGNUP_ERROR = 'app/Auth/SIGNUP_ERROR';

export const CONFIRM_REQUEST = 'app/Auth/CONFIRM_REQUEST';
export const CONFIRM_SUCCESS = 'app/Auth/CONFIRM_SUCCESS';
export const CONFIRM_ERROR = 'app/Auth/CONFIRM_ERROR';

export const USER_LOGOUT = 'app/USER_LOGOUT';

// ================ Reducer ================ //

const initialState = {
  isAuthenticated: false,
  authScopes: [],
  authInfoLoaded: false,
  loginError: null,
  loginInProgress: false,
  logoutError: null,
  logoutInProgress: false,
  signupError: null,
  signupInProgress: false,
  confirmError: null,
  confirmInProgress: false,
};

export default function reducer(state = initialState, action = {}) {
  const { type, payload } = action;
  switch (type) {
    case AUTH_INFO_REQUEST:
      return state;
    case AUTH_INFO_SUCCESS:
      return {
        ...state,
        authInfoLoaded: true,
        isAuthenticated: authenticated(payload),
        authScopes: payload ? payload.scopes || [] : [],
      };
    case LOGIN_REQUEST:
      return {
        ...state,
        loginInProgress: true,
        loginError: null,
        logoutError: null,
        signupError: null,
      };
    case LOGIN_SUCCESS:
      return { ...state, loginInProgress: false, isAuthenticated: true };
    case LOGIN_ERROR:
      return { ...state, loginInProgress: false, loginError: payload };
    case LOGOUT_REQUEST:
      return { ...state, logoutInProgress: true, loginError: null, logoutError: null };
    case LOGOUT_SUCCESS:
      return { ...state, logoutInProgress: false, isAuthenticated: false, authScopes: [] };
    case LOGOUT_ERROR:
      return { ...state, logoutInProgress: false, logoutError: payload };
    case SIGNUP_REQUEST:
      return { ...state, signupInProgress: true, loginError: null, signupError: null };
    case SIGNUP_SUCCESS:
      return { ...state, signupInProgress: false };
    case SIGNUP_ERROR:
      return { ...state, signupInProgress: false, signupError: payload };
    case CONFIRM_REQUEST:
      return { ...state, confirmInProgress: true, loginError: null, confirmError: null };
    case CONFIRM_SUCCESS:
      return { ...state, confirmInProgress: false, isAuthenticated: true };
    case CONFIRM_ERROR:
      return { ...state, confirmInProgress: false, confirmError: payload };
    default:
      return state;
  }
}

// ================ Selectors ================ //

export const authenticationInProgress = state => {
  const { loginInProgress, logoutInProgress, signupInProgress } = state.Auth;
  return loginInProgress || logoutInProgress || signupInProgress;
};

// ================ Action creators ================ //

export const authInfoRequest = () => ({ type: AUTH_INFO_REQUEST });
export const authInfoSuccess = info => ({ type: AUTH_INFO_SUCCESS, payload: info });

export const loginRequest = () => ({ type: LOGIN_REQUEST });
export const loginSuccess = () => ({ type: LOGIN_SUCCESS });
export const loginError = error => ({ type: LOGIN_ERROR, payload: error, error: true });

export const logoutRequest = () => ({ type: LOGOUT_REQUEST });
export const logoutSuccess = () => ({ type: LOGOUT_SUCCESS });
export const logoutError = error => ({ type: LOGOUT_ERROR, payload: error, error: true });

export const signupRequest = () => ({ type: SIGNUP_REQUEST });
export const signupSuccess = () => ({ type: SIGNUP_SUCCESS });
export const signupError = error => ({ type: SIGNUP_ERROR, payload: error, error: true });

export const confirmRequest = () => ({ type: CONFIRM_REQUEST });
export const confirmSuccess = () => ({ type: CONFIRM_SUCCESS });
export const confirmError = error => ({ type: CONFIRM_ERROR, payload: error, error: true });

export const userLogout = () => ({ type: USER_LOGOUT });

// ================ Thunks ================ //

export const authInfo = () => (dispatch, getState, sdk) => {
  dispatch(authInfoRequest());
  return fetch('/api/auth/current-user', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      if (data && data.data) {
        dispatch(authInfoSuccess({ isAnonymous: false, scopes: [] }));
      } else {
        dispatch(authInfoSuccess(null));
      }
    })
    .catch(e => {
      log.error(e, 'auth-info-failed');
      dispatch(authInfoSuccess(null));
    });
};

export const login = (username, password) => (dispatch, getState, sdk) => {
  if (authenticationInProgress(getState())) {
    return Promise.reject(new Error('Login or logout already in progress'));
  }
  dispatch(loginRequest());
  return fetch('/api/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: username, password }),
  })
    .then(res => {
      if (!res.ok) throw new Error('Invalid email or password');
      return res.json();
    })
    .then(() => dispatch(loginSuccess()))
    .then(() => dispatch(fetchCurrentUser()))
    .catch(e => dispatch(loginError(storableError(e))));
};

export const logout = () => (dispatch, getState, sdk) => {
  if (authenticationInProgress(getState())) {
    return Promise.reject(new Error('Login or logout already in progress'));
  }
  dispatch(logoutRequest());
  return fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  })
    .then(() => {
      dispatch(logoutSuccess());
      dispatch(clearCurrentUser());
      log.clearUserId();
      dispatch(userLogout());
    })
    .catch(e => dispatch(logoutError(storableError(e))));
};

export const signup = params => (dispatch, getState, sdk) => {
  if (authenticationInProgress(getState())) {
    return Promise.reject(new Error('Login or logout already in progress'));
  }
  dispatch(signupRequest());
  const { userType, email, password, firstName, lastName, ...rest } = params;

  const createUserParams = isEmpty(rest)
    ? { email, password, firstName, lastName, publicData: { userType } }
    : {
        email,
        password,
        firstName,
        lastName,
        publicData: { userType },
        protectedData: { ...rest },
      };

  return fetch('/api/auth/signup', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password,
      firstName,
      lastName,
      userType,
      publicData: createUserParams.publicData,
    }),
  })
    .then(res => {
      if (!res.ok) return res.json().then(d => { throw new Error(d.errors?.[0]?.title || 'Signup failed'); });
      return res.json();
    })
    .then(() => dispatch(signupSuccess()))
    .then(() => dispatch(login(email, password)))
    .catch(e => {
      dispatch(signupError(storableError(e)));
      log.error(e, 'signup-failed', {
        email: params.email,
        firstName: params.firstName,
        lastName: params.lastName,
      });
    });
};

export const signupWithIdp = params => (dispatch, getState, sdk) => {
  dispatch(confirmRequest());
  return createUserWithIdp(params)
    .then(() => dispatch(confirmSuccess()))
    .then(() => dispatch(fetchCurrentUser()))
    .catch(e => {
      log.error(e, 'create-user-with-idp-failed', { params });
      return dispatch(confirmError(storableError(e)));
    });
};