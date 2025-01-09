import React from 'react';
import { compose } from 'redux';
import { withRouter } from 'react-router-dom';
import { intlShape, injectIntl, FormattedMessage } from '../../util/reactIntl';
import { array, bool, func, node, object, oneOfType, shape, string } from 'prop-types';
import classNames from 'classnames';
import omit from 'lodash/omit';
import { propTypes, LISTING_STATE_CLOSED, LINE_ITEM_NIGHT, LINE_ITEM_DAY } from '../../util/types';
import { formatMoney } from '../../util/currency';
import { convertTime, parse, stringify } from '../../util/urlHelpers';
import config from '../../config';
import {
  ModalInMobile,
  Button,
  ResponsiveImage,
  AvatarMedium,
  IconSpinner,
  ExternalLink,
  FieldSelectModern,
} from '../../components';
import { BookingTimeForm } from '../../forms';
import moment from 'moment';
import { ensureListing, ensureUser } from '../../util/data';

import css from './BookingPanel.module.css';
import { Form } from 'react-final-form';
import AddMoreMeetings from '../../containers/addMoreMeetings/AddMoreMeetings';

// This defines when ModalInMobile shows content as Modal
const MODAL_BREAKPOINT = 1023;
const TODAY = new Date();

const priceData = (price, intl) => {
  if (price && price.currency === config.currency) {
    const formattedPrice = formatMoney(intl, price);
    return { formattedPrice, priceTitle: formattedPrice };
  } else if (price) {
    return {
      formattedPrice: `(${price.currency})`,
      priceTitle: `Unsupported currency (${price.currency})`,
    };
  }
  return {};
};

const openBookModal = (isOwnListing, isClosed, history, location) => {
  if (isOwnListing || isClosed) {
    window.scrollTo(0, 0);
  } else {
    const { pathname, search, state } = location;
    const searchString = `?${stringify({ ...parse(search), book: true })}`;
    history.push(`${pathname}${searchString}`, state);
  }
};

const closeBookModal = (history, location) => {
  const { pathname, search, state } = location;
  const searchParams = omit(parse(search), 'book');
  const searchString = `?${stringify(searchParams)}`;
  history.push(`${pathname}${searchString}`, state);
};

const dateFormattingOptions = { month: 'short', day: 'numeric', weekday: 'short' };

const BookingPanel = props => {
  const {
    rootClassName,
    className,
    titleClassName,
    listing,
    isOwnListing,
    unitType,
    onSubmit,
    title,
    subTitle,
    onManageDisableScrolling,
    onFetchTimeSlots,
    monthlyTimeSlots,
    history,
    location,
    intl,
    onFetchTransactionLineItems,
    lineItems,
    fetchLineItemsInProgress,
    fetchLineItemsError,
    checkOldTransactionLoading,
    checkOldTransactionError,
    checkOldTransactionData,
    join_url,
    zoomLoading,
    zoomError,
  } = props;
  const isCancelled = checkOldTransactionData?.attributes?.lastTransition === 'transition/cancel';
  const transactionId = checkOldTransactionData?.id?.uuid;
  const subscriptionId = checkOldTransactionData?.attributes?.metadata?.subscriptionId;
  const isAccepted = checkOldTransactionData?.attributes?.lastTransition === 'transition/accept';
  console.log(checkOldTransactionData, 'checkOldTransactionData panel');
  const shouldShowJoinUrl = () => {
    if (checkOldTransactionData) {
      const processName = checkOldTransactionData.attributes.processName;
      if (processName === 'flex-subscription' && subscriptionId) {
        return true;
      }
      if (processName === 'flex-hourly-default-process' && transactionId && isAccepted) {
        return true;
      }
    }
    return false;
  };
  console.log(join_url, 'join_url');
  const joinUrl =
    join_url && shouldShowJoinUrl() ? (
      <div className="mt-4 w-full  bg-marketplaceColor hover:bg-marketplaceColorDark transition duration-100 rounded shadow">
        <ExternalLink
          href={join_url}
          className="py-2 w-full h-full block text-center text-white hover:no-underline font-semibold tracking-wide"
        >
          Join Meeting
        </ExternalLink>
      </div>
    ) : null;
  const price = listing.attributes.price;
  const timeZone =
    listing.attributes.availabilityPlan && listing.attributes.availabilityPlan.timezone;
  const hasListingState = !!listing.attributes.state;
  const isClosed = hasListingState && listing.attributes.state === LISTING_STATE_CLOSED;
  const showBookingTimeForm = hasListingState && !isClosed;
  const showClosedListingHelpText = listing.id && isClosed;
  const { formattedPrice, priceTitle } = priceData(price, intl);
  const monthlyPrice = listing.attributes.publicData?.monthlyPrice;
  const isBook = !!parse(location.search).book;
  const { publicData } = listing.attributes;
  const isRecurring = publicData?.paymentType.some(type => type.value === 'recurring');
  // console.log('BookingPanel props', publicData);
  const currentListing = ensureListing(listing);
  const currentAuthor = ensureUser(currentListing.author);
  const bookingType = publicData?.type;
  const isFreeBooking = bookingType === 'free';
  const { quantity } = currentListing?.currentStock?.attributes || {};
  let isStockZero = false;
  if (quantity === 0) {
    isStockZero = true;
  }
  const firstImage =
    currentListing.images && currentListing.images.length > 0 ? currentListing.images[0] : null;
  const subTitleText = !!subTitle
    ? subTitle
    : showClosedListingHelpText
    ? intl.formatMessage({ id: 'BookingPanel.subTitleClosedListing' })
    : null;

  const isNightly = unitType === LINE_ITEM_NIGHT;
  const isDaily = unitType === LINE_ITEM_DAY;

  const unitTranslationKey = isNightly
    ? 'BookingPanel.perNight'
    : isDaily
    ? 'BookingPanel.perDay'
    : 'BookingPanel.perUnit';

  const classes = classNames(rootClassName || css.root, className);
  const titleClasses = classNames(titleClassName || css.bookingTitle);

  const loading =
    checkOldTransactionLoading || zoomLoading ? (
      <div className={classes}>
        <span>Loading...</span>{' '}
        <span>
          <IconSpinner />
        </span>
      </div>
    ) : null;

  const formattedDate = convertTime(publicData?.startDateString, publicData.timezone);
  // const formattedDate = convertTime(publicData.startDate, publicData.timezone);
  // moment(publicData.startDate).tz(publicData.timezone, true).local().format('dddd, MMMM Do YYYY, h:mm a')
  return (
    <div className={classes}>
      <ModalInMobile
        containerClassName={css.modalContainer}
        id="BookingTimeFormInModal"
        isModalOpenOnMobile={isBook}
        onClose={() => closeBookModal(history, location)}
        showAsModalMaxWidth={MODAL_BREAKPOINT}
        onManageDisableScrolling={onManageDisableScrolling}
      >
        <div className={css.modalHeading}>{/* <h1 className={css.title}>{title}</h1> */}</div>
        {/* <div className={css.bookingHeading}>
          <h3>Price:</h3>
          <div className={css.desktopPriceContainer}>
            <div className={css.desktopPriceValue} title={priceTitle}>
              {formattedPrice}
            </div>
            <div className={css.desktopPerUnit}>
              <FormattedMessage id={unitTranslationKey} />
            </div>
          </div>
          <h3>Start date:</h3>
          <p>{formattedDate}</p>
          <div className={css.bookingHeadingContainer}>
            <h2 className={titleClasses}>{title}</h2>
            {subTitleText ? <div className={css.bookingHelp}>{subTitleText}</div> : null}
          </div>
        </div> */}
        {/* <div className={css.detailsContainerDesktop}>
          <div className={css.detailsAspectWrapper}>
            <ResponsiveImage
              rootClassName={css.rootForImage}
              alt={title}
              image={firstImage}
              variants={['landscape-crop', 'landscape-crop2x']}
            />
          </div>
          <div className={css.detailsHeadings}>
            <h2 className={css.detailsTitle}>{title}</h2>

            {isFreeBooking ? (
              <p className={css.detailsSubtitle} style={{ paddingBottom: '10px' }}>
                Free
              </p>
            ) : (
              <p className={css.detailsSubtitle} style={{ paddingBottom: '10px' }}>
                <b>Price:</b>
                {formattedPrice} per person
              </p>
            )}
            <p className={css.detailsSubtitle}>
              <b>Start date:</b> {formattedDate}
            </p>
          </div>
        </div> */}
        {loading}
        {/* {panelCard} */}
        {showBookingTimeForm ? (
          <BookingTimeForm
            className={css.bookingForm}
            formId="BookingPanel"
            submitButtonWrapperClassName={css.submitButtonWrapper}
            listing={listing}
            unitType={unitType}
            onSubmit={onSubmit}
            price={price}
            isStockZero={isStockZero}
            startDate={formattedDate}
            seats={publicData.seats}
            listingId={listing.id}
            isOwnListing={isOwnListing}
            monthlyTimeSlots={monthlyTimeSlots}
            onFetchTimeSlots={onFetchTimeSlots}
            startDatePlaceholder={intl.formatDate(TODAY, dateFormattingOptions)}
            endDatePlaceholder={intl.formatDate(TODAY, dateFormattingOptions)}
            timeZone={timeZone}
            onFetchTransactionLineItems={onFetchTransactionLineItems}
            lineItems={lineItems}
            fetchLineItemsInProgress={fetchLineItemsInProgress}
            fetchLineItemsError={fetchLineItemsError}
            bookingType={bookingType}
            transactionId={transactionId}
            joinUrl={joinUrl}
            // panelCard={panelCard}
            loading={loading}
            title={title}
            firstImage={firstImage}
            formattedPrice={formattedPrice}
            formattedDate={formattedDate}
            monthlyPrice={monthlyPrice}
            subscriptionId={subscriptionId}
            checkOldTransactionData={checkOldTransactionData}
          />
        ) : null}
      </ModalInMobile>
      <div className={css.openBookingForm}>
        <div className={css.priceContainer}>
          <div className={css.priceValue} title={priceTitle}>
            {formattedPrice}
          </div>
          <div className={css.perUnit}>
            <FormattedMessage id={unitTranslationKey} />
          </div>
        </div>
        <div className={css.addMoreMeetings}> </div>
        {showBookingTimeForm ? (
          <Button
            rootClassName={css.bookButton}
            onClick={() => openBookModal(isOwnListing, isClosed, history, location)}
          >
            <FormattedMessage id="BookingPanel.ctaButtonMessage" />
          </Button>
        ) : isClosed ? (
          <div className={css.closedListingButton}>
            <FormattedMessage id="BookingPanel.closedListingButtonText" />
          </div>
        ) : null}
      </div>
    </div>
  );
};

BookingPanel.defaultProps = {
  rootClassName: null,
  className: null,
  titleClassName: null,
  isOwnListing: false,
  subTitle: null,
  unitType: config.bookingUnitType,
  monthlyTimeSlots: null,
  lineItems: null,
  fetchLineItemsError: null,
};

BookingPanel.propTypes = {
  rootClassName: string,
  className: string,
  titleClassName: string,
  listing: oneOfType([propTypes.listing, propTypes.ownListing]),
  isOwnListing: bool,
  unitType: propTypes.bookingUnitType,
  onSubmit: func.isRequired,
  title: oneOfType([node, string]).isRequired,
  subTitle: oneOfType([node, string]),
  authorDisplayName: oneOfType([node, string]).isRequired,
  onManageDisableScrolling: func.isRequired,
  onFetchTimeSlots: func.isRequired,
  monthlyTimeSlots: object,
  onFetchTransactionLineItems: func.isRequired,
  lineItems: array,
  fetchLineItemsInProgress: bool.isRequired,
  fetchLineItemsError: propTypes.error,

  // from withRouter
  history: shape({
    push: func.isRequired,
  }).isRequired,
  location: shape({
    search: string,
  }).isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

export default compose(
  withRouter,
  injectIntl
)(BookingPanel);
