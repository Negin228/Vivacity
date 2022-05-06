import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { ACCOUNT_SETTINGS_PAGES } from '../../routeConfiguration';
import { LinkTabNavHorizontal } from '../../components';
import { ensureOwnListing } from '../../util/data';
import { LISTING_STATE_DRAFT } from '../../util/types';
import { getListingType, createSlug } from '../../util/urlHelpers';
import { connect } from 'react-redux';

import css from './UserNav.module.css';

const listingTab = (listing, selectedPageName) => {
  if (!listing) {
    return {
      text: <FormattedMessage id="UserNav.newListing" />,
      selected: selectedPageName === 'NewListingPage',
      linkProps: {
        name: 'NewListingPage',
      },
    };
  }
  const currentListing = ensureOwnListing(listing);
  const id = currentListing.id.uuid;
  const { title = '', state } = currentListing.attributes;
  const slug = createSlug(title);
  const isDraft = state === LISTING_STATE_DRAFT;

  return {
    text: <FormattedMessage id="UserNav.editListing" />,
    selected: selectedPageName === 'EditListingPage',
    linkProps: {
      name: 'EditListingPage',
      params: {
        id,
        slug,
        type: getListingType(isDraft),
        tab: 'photos',
      },
    },
  };
};

const UserNav = props => {
  const {
    className,
    rootClassName,
    selectedPageName,
    currentUser,
    isCurrentUserClient,
    listing,
  } = props;
  const classes = classNames(rootClassName || css.root, className);
  const currentUserIsProvider =
    currentUser?.attributes?.profile?.publicData?.userType === 'teacher';
  const tabObj = {
    text: <FormattedMessage id="ManageListingsPage.yourListings" />,
    selected: selectedPageName === 'ManageListingsPage',
    linkProps: {
      name: 'ManageListingsPage',
    },
    disabled: isCurrentUserClient,
  };
  let tabs = [];
  tabs = [
    {
      text: <FormattedMessage id="UserNav.profileSettingsPage" />,
      selected: selectedPageName === 'ProfileSettingsPage',
      disabled: false,
      linkProps: {
        name: 'ProfileSettingsPage',
      },
    },
    {
      text: <FormattedMessage id="UserNav.contactDetailsPage" />,
      selected: ACCOUNT_SETTINGS_PAGES.includes(selectedPageName),
      disabled: false,
      linkProps: {
        name: 'ContactDetailsPage',
      },
    },
  ];

  if (currentUserIsProvider) {
    tabs = [...tabs, tabObj];
  }

  return (
    <LinkTabNavHorizontal className={classes} tabRootClassName={css.tab} tabs={tabs} skin="dark" />
  );
};

UserNav.defaultProps = {
  className: null,
  rootClassName: null,
};

const { string } = PropTypes;

UserNav.propTypes = {
  className: string,
  rootClassName: string,
  selectedPageName: string.isRequired,
};

const mapStateToProps = state => ({ currentUser: state.user.currentUser });
const mapDispatchToProps = dispatch => ({});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserNav);
