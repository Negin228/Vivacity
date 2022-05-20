import config from '../../config';
import { addMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import { denormalisedResponseEntities } from '../../util/data';
import { storableError } from '../../util/errors';
const PRODUCTS_FETCH_REQUEST = 'app/LandingPage/PRODUCTS_FETCH_REQUEST';
const PRODUCTS_FETCH_SUCCESS = 'app/LandingPage/PRODUCTS_FETCH_SUCCESS';
const PRODUCTS_FETCH_ERROR = 'app/LandingPage/PRODUCTS_FETCH_ERROR';
const TRAINER_FETCH_REQUEST = 'app/LandingPage/TRAINER_FETCH_REQUEST';
const TRAINER_FETCH_SUCCESS = 'app/LandingPage/TRAINER_FETCH_SUCCESS';
const TRAINER_FETCH_ERROR = 'app/LandingPage/TRAINER_FETCH_ERROR';
import axios from 'axios';

const initialState = {
  productsLoading: false,
  productIds: null,
  productsError: null,
  trainersLoading: false,
  trainerIds: null,
  trainersError: null,
};

const resultIds = data => data.map(l => l.id);

function reducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case PRODUCTS_FETCH_REQUEST:
      return { ...state, productsLoading: true, productsError: null };
    case PRODUCTS_FETCH_SUCCESS:
      return {
        ...state,
        productsLoading: false,
        productsError: null,
        productIds: resultIds(payload),
      };
    case PRODUCTS_FETCH_ERROR:
      return {
        ...state,
        productsLoading: false,
        productIds: null,
        productsError: payload,
      };
    case TRAINER_FETCH_REQUEST:
      return { ...state, trainersLoading: true, trainersError: null };
    case TRAINER_FETCH_SUCCESS:
      console.log(payload);
      return {
        ...state,
        trainersLoading: false,
        trainersError: null,
        trainerData: payload,
      };
    case TRAINER_FETCH_ERROR:
      return {
        ...state,
        trainersLoading: false,
        trainerIds: null,
        trainersError: payload,
      };
    default:
      return state;
  }
}

export default reducer;

export const fetchProductsRequest = () => ({ type: PRODUCTS_FETCH_REQUEST });
export const fetchProductsSuccess = payload => ({ type: PRODUCTS_FETCH_SUCCESS, payload });
export const fetchProductsError = error => ({ type: PRODUCTS_FETCH_ERROR, payload: error });
export const fetchTrainerRequest = () => ({ type: TRAINER_FETCH_REQUEST });
export const fetchTrainerSuccess = payload => ({ type: TRAINER_FETCH_SUCCESS, payload });
export const fetchTrainerError = error => ({ type: TRAINER_FETCH_ERROR, payload: error });

console.log('hit');
export const getAllListings = () => async (dispatch, getState, sdk) => {
  dispatch(fetchProductsRequest());

  try {
    const response = await sdk.listings.query({
      include: ['images', 'author'],
      'fields.listing': ['title', 'metadata', 'price', 'publicData', 'createdAt'],
      'fields.image': [
        'variants.landscape-crop',
        'variants.landscape-crop2x',
        'variants.square-small',
        'variants.square-small2x',
      ],
      'limit.images': 1,
      perPage: 10,
      // pub_featured: true,
    });

    dispatch(addMarketplaceEntities(response));
    const denormalisedResponse = denormalisedResponseEntities(response);
    dispatch(fetchProductsSuccess(denormalisedResponse));

    return response;
  } catch (e) {
    console.log(e);
    dispatch(fetchProductsError(storableError(e)));
  }
};

export const getAllTrainers = () => async (dispatch, getState) => {
  dispatch(fetchTrainerRequest());
  try {
    axios
      .get('http://localhost:4000/trainers')
      .then(res => {
        const denormalisedResponse = denormalisedResponseEntities(res);
        dispatch(fetchTrainerSuccess(denormalisedResponse));
      })
      .catch(e => console.log('error in trainer duck method: ', e));
  } catch (err) {
    console.log('error in catch for trainers, landing duck: ', err);
    dispatch(fetchTrainerError(storableError(err)));
  }
};

export const loadData = params => (dispatch, getState, sdk) => {
  console.log('hit3');
  return Promise.all([dispatch(getAllListings()), dispatch(getAllTrainers())])
    .then(responses => {
      return responses;
    })
    .catch(e => {
      throw e;
    });
};
