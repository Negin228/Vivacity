import React, { Component } from 'react';
import { array, bool, func, object, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm, FormSpy } from 'react-final-form';
import classNames from 'classnames';
import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';
import { timestampToDate } from '../../util/dates';
import { propTypes } from '../../util/types';
import config from '../../config';
import { types as sdkTypes } from '../../util/sdkLoader';
const { Money } = sdkTypes;
import { formatMoney } from '../../util/currency';
import {
  FieldSelectModern,
  Form,
  IconSpinner,
  PrimaryButton,
  ResponsiveImage,
} from '../../components';
import EstimatedBreakdownMaybe from './EstimatedBreakdownMaybe';
import FieldDateAndTimeInput from './FieldDateAndTimeInput';

import css from './BookingTimeForm.module.css';
import { required } from '../../util/validators';
import moment from 'moment';
import { convertTime } from '../../util/urlHelpers';

export class BookingTimeFormComponent extends Component {
  constructor(props) {
    super(props);

    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleOnChange = this.handleOnChange.bind(this);
  }

  handleFormSubmit(e) {
    this.props.onSubmit(e);
  }

  handleOnChange(formValues) {
    const { bookingStartTime, bookingEndTime } = formValues.values;
    const startDate = bookingStartTime ? timestampToDate(bookingStartTime) : null;
    const endDate = bookingEndTime ? timestampToDate(bookingEndTime) : null;

    const listingId = this.props.listingId;
    const isOwnListing = this.props.isOwnListing;

    const isSameTime = bookingStartTime === bookingEndTime;

    if (bookingStartTime && bookingEndTime && !isSameTime && !this.props.fetchLineItemsInProgress) {
      this.props.onFetchTransactionLineItems({
        bookingData: { startDate, endDate },
        listingId,
        isOwnListing,
      });
    }
  }

  render() {
    const { rootClassName, className, price: unitPrice, bookingType, ...rest } = this.props;
    const classes = classNames(rootClassName || css.root, className);
    const isFreeBooking = bookingType === 'free';

    if (!unitPrice && !isFreeBooking) {
      return (
        <div className={classes}>
          <p className={css.error}>
            <FormattedMessage id="BookingTimeForm.listingPriceMissing" />
          </p>
        </div>
      );
    }
    if (unitPrice?.currency !== config?.currency && !isFreeBooking) {
      return (
        <div className={classes}>
          <p className={css.error}>
            <FormattedMessage id="BookingTimeForm.listingCurrencyInvalid" />
          </p>
        </div>
      );
    }

    return (
      <FinalForm
        {...rest}
        unitPrice={unitPrice}
        onSubmit={this.handleFormSubmit}
        render={fieldRenderProps => {
          const {
            endDatePlaceholder,
            startDatePlaceholder,
            form,
            pristine,
            handleSubmit,
            intl,
            isOwnListing,
            listingId,
            submitButtonWrapperClassName,
            unitType,
            values,
            monthlyTimeSlots,
            onFetchTimeSlots,
            timeZone,
            lineItems,
            fetchLineItemsInProgress,
            fetchLineItemsError,
            startDate,
            seats,
            isStockZero,
            transactionId,
            joinUrl,
            loading,
            listing,
            title,
            firstImage,
            formattedPrice,
            formattedDate,
            monthlyPrice,
            subscriptionId,
            checkOldTransactionData,
          } = fieldRenderProps;

          const isDateInPast = (startDateString, timezone) => {
            const listingTime = moment.tz(startDateString, timezone);
            const currentTime = moment().tz(timezone);
            return listingTime.isBefore(currentTime);
          };

          const getNextClassDate = (startDate, weeklyDays, timezone) => {
            if (!isDateInPast(startDate, timezone)) {
              return null;
            }

            const now = moment().tz(timezone);
            const availableDays = weeklyDays.map(day => parseInt(day.value)).sort((a, b) => a - b);
            const currentDay = now.day() + 1;
            const nextDay = availableDays.find(d => d > currentDay) || availableDays[0];
            const daysToAdd =
              nextDay > currentDay ? nextDay - currentDay : 7 - currentDay + nextDay;

            // Use convertTime for consistent formatting
            const nextDate = now
              .add(daysToAdd, 'days')
              .hour(moment.tz(startDate, timezone).hour())
              .minute(moment.tz(startDate, timezone).minute());

            return convertTime(nextDate.format('YYYY-MM-DD HH:mm:ss'), timezone);
          };
          const nextClass = isDateInPast(
            listing.attributes.publicData.startDate,
            listing.attributes.publicData.timezone
          )
            ? getNextClassDate(
                listing.attributes.publicData.startDate,
                listing.attributes.publicData.weeklyDays,
                listing.attributes.publicData.timezone
              )
            : null;
          console.log(checkOldTransactionData, 'checkOldTransactionData form');
          console.log(values);

          let formattedMonthlyPrice = null;
          if (monthlyPrice) {
            const newMonthlyPrice = new Money(monthlyPrice, config.currency);
            formattedMonthlyPrice = formatMoney(intl, newMonthlyPrice);
          }

          if (loading) return null;
          const startTime = values && values.bookingStartTime ? values.bookingStartTime : null;
          const endTime = values && values.bookingEndTime ? values.bookingEndTime : null;

          const bookingStartLabel = intl.formatMessage({
            id: 'BookingTimeForm.bookingStartTitle',
          });
          const bookingEndLabel = intl.formatMessage({
            id: 'BookingTimeForm.bookingEndTitle',
          });

          const endDate = endTime ? timestampToDate(endTime) : null;

          const bookingData =
            startDate && endDate
              ? {
                  unitType,
                  startDate,
                  seats,
                  timeZone,
                }
              : null;

          const showEstimatedBreakdown =
            bookingData && lineItems && !fetchLineItemsInProgress && !fetchLineItemsError;

          const bookingInfoMaybe = showEstimatedBreakdown ? (
            <div className={css.priceBreakdownContainer}>
              <h3 className={css.priceBreakdownTitle}>
                <FormattedMessage id="BookingTimeForm.priceBreakdownTitle" />
              </h3>
              <EstimatedBreakdownMaybe bookingData={bookingData} lineItems={lineItems} />
            </div>
          ) : null;

          const loadingSpinnerMaybe = fetchLineItemsInProgress ? (
            <IconSpinner className={css.spinner} />
          ) : null;

          const bookingInfoErrorMaybe = fetchLineItemsError ? (
            <span className={css.sideBarError}>
              <FormattedMessage id="BookingDatesForm.fetchLineItemsError" />
            </span>
          ) : null;

          const submitButtonClasses = classNames(
            submitButtonWrapperClassName || css.submitButtonWrapper
          );

          const startDateInputProps = {
            label: bookingStartLabel,
            placeholderText: startDatePlaceholder,
          };
          const endDateInputProps = {
            label: bookingEndLabel,
            placeholderText: endDatePlaceholder,
          };

          const dateInputProps = {
            startDateInputProps,
            endDateInputProps,
          };
          let paymentMethodOptions = [];

          const paymentType = listing?.attributes?.publicData?.paymentType;
          const { publicData } = listing?.attributes;
          const weeklyDays = publicData?.weeklyDays;

          console.log(paymentType, 'paymentType');
          const isRecurringOnly = paymentType?.length === 1 && paymentType[0].value === 'recurring';
          const isPerSessionOnly =
            paymentType?.length === 1 && paymentType[0].value === 'per_session';
          const hasBoth =
            paymentType?.length === 2 &&
            paymentType.some(type => type.value === 'recurring') &&
            paymentType.some(type => type.value === 'per_session');

          if (isRecurringOnly) {
            paymentMethodOptions.push({ label: 'Subscription', value: 'recurring' });
          } else if (isPerSessionOnly) {
            paymentMethodOptions.push({ label: 'Pay Per Session', value: 'per_session' });
          } else if (hasBoth) {
            paymentMethodOptions.push({ label: 'Subscription', value: 'recurring' });
            paymentMethodOptions.push({ label: 'Pay Per Session', value: 'per_session' });
          } else {
            paymentMethodOptions.push({ label: 'Pay Per Session', value: 'per_session' });
          }
          console.log(paymentMethodOptions);
          const isAccepted =
            checkOldTransactionData?.attributes?.lastTransition === 'transition/accept';
          const shouldDisableButton = () => {
            if (checkOldTransactionData) {
              const processName = checkOldTransactionData.attributes.processName;
              if (processName === 'flex-subscription' && subscriptionId) {
                return true;
              }
              if (processName === 'flex-hourly-default-process' && transactionId) {
                return true;
              }
            }
            return false;
          };
          console.log(shouldDisableButton(), 'shouldDisableButton');

          const panelCard = (
            <div className={css.detailsContainerDesktop}>
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
                    <b>Price: </b>
                    {values?.paymentMethod?.value === 'recurring'
                      ? `${formattedMonthlyPrice} Per Month`
                      : `${formattedPrice} ${isRecurringOnly ? 'Per Month' : 'Per Session'}`}
                  </p>
                )}
                <p className={css.detailsSubtitle}>
                  <b>Start date:</b> {formattedDate}
                </p>
                {nextClass && (
                  <p className={css.detailsSubtitle}>
                    <b>Next class:</b> {nextClass}
                  </p>
                )}
              </div>
            </div>
          );
          return (
            <>
              {panelCard}
              <Form
                onSubmit={handleSubmit}
                className={classes}
                enforcePagePreloadFor="CheckoutPage"
              >
                <FormSpy
                  subscription={{ values: true }}
                  onChange={values => {
                    this.handleOnChange(values);
                  }}
                />
                {bookingInfoMaybe}
                {loadingSpinnerMaybe}
                {bookingInfoErrorMaybe}
                <FieldSelectModern
                  id="paymentMethod"
                  name="paymentMethod"
                  label="Payment Method"
                  className={css.select}
                  options={paymentMethodOptions}
                  validate={required(
                    intl.formatMessage({
                      id: 'ProductOrderForm.paymentMethodRequired',
                    })
                  )}
                  placeholder={intl.formatMessage({
                    id: 'ProductOrderForm.paymentMethodPlaceholder',
                  })}
                  isSearchable={false}
                />

                <br />
                <p className={css.smallPrint}>
                  {isStockZero ? null : (
                    <FormattedMessage
                      id={
                        isOwnListing
                          ? 'BookingTimeForm.ownListing'
                          : 'BookingTimeForm.youWontBeChargedInfo'
                      }
                    />
                  )}
                </p>
                <div className={submitButtonClasses}>
                  <PrimaryButton type="submit" disabled={shouldDisableButton()}>
                    {shouldDisableButton() ? (
                      <FormattedMessage id="BookingTimeForm.BookingTimeForm.alreadyRegisterLabel" />
                    ) : isStockZero ? (
                      'All class tickets are sold!'
                    ) : (
                      <FormattedMessage id="BookingTimeForm.requestToBook" />
                    )}
                  </PrimaryButton>
                  {joinUrl}
                </div>
              </Form>
            </>
          );
        }}
      />
    );
  }
}

BookingTimeFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  submitButtonWrapperClassName: null,
  price: null,
  isOwnListing: false,
  listingId: null,
  startDatePlaceholder: null,
  endDatePlaceholder: null,
  monthlyTimeSlots: null,
  lineItems: null,
  fetchLineItemsError: null,
};

BookingTimeFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  submitButtonWrapperClassName: string,

  unitType: propTypes.bookingUnitType.isRequired,
  price: propTypes.money,
  isOwnListing: bool,
  listingId: propTypes.uuid,
  monthlyTimeSlots: object,
  onFetchTimeSlots: func.isRequired,

  onFetchTransactionLineItems: func.isRequired,
  lineItems: array,
  fetchLineItemsInProgress: bool.isRequired,
  fetchLineItemsError: propTypes.error,

  // from injectIntl
  intl: intlShape.isRequired,

  // for tests
  startDatePlaceholder: string,
  endDatePlaceholder: string,
};

const BookingTimeForm = compose(injectIntl)(BookingTimeFormComponent);
BookingTimeForm.displayName = 'BookingTimeForm';

export default BookingTimeForm;
