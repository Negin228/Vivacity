import React from 'react';
import { bool, oneOfType, object } from 'prop-types';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import {
  LISTING_STATE_PENDING_APPROVAL,
  LISTING_STATE_CLOSED,
  LISTING_STATE_DRAFT,
  propTypes,
} from '../../util/types';
import { NamedLink } from '../../components';
import EditIcon from './EditIcon';
import css from './ListingPage.module.css';
import moment from 'moment';
export const ActionBarMaybe = props => {
  const { isOwnListing, listing, editParams } = props;
  const { id, slug, type } = editParams;
  const state = listing.attributes.state;
  const isPendingApproval = state === LISTING_STATE_PENDING_APPROVAL;
  const isClosed = state === LISTING_STATE_CLOSED;
  const isDraft = state === LISTING_STATE_DRAFT;
  console.log('Listing: actionbar ', listing);
  const isRecurringPayment = listing?.attributes?.publicData?.paymentType?.some(
    type => type.value === 'recurring'
  );
  const getMeetingStatus = () => {
    const lastClass = listing?.attributes?.publicData?.lastClass;
    if (!lastClass) return 'no-meetings';

    const lastClassDate = moment.unix(lastClass);
    const today = moment();
    const daysUntilExpiry = lastClassDate.diff(today, 'days');

    if (daysUntilExpiry <= 0) return 'expired';
    if (daysUntilExpiry <= 15) return 'expiring-soon';
    return 'active';
  };

  const meetingStatus = getMeetingStatus();
  const hasLastClass = Boolean(listing?.attributes?.publicData?.lastClass);
  const showExpiryWarning =
    isOwnListing && isRecurringPayment && hasLastClass && meetingStatus !== 'active';

  const warningMessage =
    showExpiryWarning &&
    (meetingStatus === 'expired'
      ? 'Your Zoom meetings have expired. Please extend them from the Edit listing page.'
      : `Your meetings will expire in ${moment
          .unix(listing.attributes.publicData.lastClass)
          .diff(moment(), 'days')} days. Please extend your Zoom meetings.`);
  if (isOwnListing) {
    let ownListingTextTranslationId = 'ListingPage.ownListing';

    if (isPendingApproval) {
      ownListingTextTranslationId = 'ListingPage.ownListingPendingApproval';
    } else if (isClosed) {
      ownListingTextTranslationId = 'ListingPage.ownClosedListing';
    } else if (isDraft) {
      ownListingTextTranslationId = 'ListingPage.ownListingDraft';
    }

    const message = isDraft ? 'ListingPage.finishListing' : 'ListingPage.editListing';

    const ownListingTextClasses = classNames(css.ownListingText, {
      [css.ownListingTextPendingApproval]: isPendingApproval,
    });

    return (
      <div className={css.actionBar}>
        <p className={ownListingTextClasses}>
          <FormattedMessage id={ownListingTextTranslationId} />
          {showExpiryWarning && <div className={css.warningMessage}>{warningMessage}</div>}
        </p>

        <NamedLink
          className={css.editListingLink}
          name="EditListingPage"
          params={{ id, slug, type, tab: 'photos' }}
        >
          <EditIcon className={css.editIcon} />
          <FormattedMessage id={message} />
        </NamedLink>
      </div>
    );
  } else if (isClosed) {
    return (
      <div className={css.actionBar}>
        <p className={css.closedListingText}>
          <FormattedMessage id="ListingPage.closedListing" />
        </p>
      </div>
    );
  }
  return null;
};

ActionBarMaybe.propTypes = {
  isOwnListing: bool.isRequired,
  listing: oneOfType([propTypes.listing, propTypes.ownListing]).isRequired,
  editParams: object.isRequired,
};

ActionBarMaybe.displayName = 'ActionBarMaybe';

export default ActionBarMaybe;
