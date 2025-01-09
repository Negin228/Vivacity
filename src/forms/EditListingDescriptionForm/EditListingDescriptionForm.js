import React, { useEffect } from 'react';
import { arrayOf, bool, func, shape, string } from 'prop-types';
import { compose } from 'redux';
import { Form as FinalForm } from 'react-final-form';
import { intlShape, injectIntl, FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import {
  maxLength,
  required,
  composeValidators,
  fieldSelectModernRequired,
} from '../../util/validators';
import arrayMutators from 'final-form-arrays';
import {
  Form,
  Button,
  FieldTextInput,
  FieldSelectModern,
  FieldCheckboxGroup,
  Datepicker,
  FieldTimeZoneSelect,
  FieldCurrencyInput,
} from '../../components';
import { isOldTotalMismatchStockError } from '../../util/errors';
import { LINE_ITEM_NIGHT, LINE_ITEM_DAY, propTypes } from '../../util/types';
import * as validators from '../../util/validators';
import { formatMoney } from '../../util/currency';
import config from '../../config';
import css from './EditListingDescriptionForm.module.css';
import { types as sdkTypes } from '../../util/sdkLoader';

const TITLE_MAX_LENGTH = 60;

const { Money } = sdkTypes;

const EditListingDescriptionFormComponent = props => (
  <FinalForm
    {...props}
    mutators={{ ...arrayMutators }}
    render={formRenderProps => {
      const {
        className,
        disabled,
        ready,
        handleSubmit,
        intl,
        invalid,
        pristine,
        saveActionMsg,
        updated,
        updateInProgress,
        fetchErrors,
        hasZoom,
        values,
        form,
      } = formRenderProps;
      console.log(values, 'form values');
      const recurrenceTypeCheck = values?.recurrence_type?.value;
      let maxRecurrence;
      switch (recurrenceTypeCheck) {
        case '1':
          maxRecurrence = 99;
          break;
        case '2':
          maxRecurrence = 50;
          break;
        case '3':
          maxRecurrence = 10;
          break;
        default:
          maxRecurrence = 60; // Default value if recurrence type is not set
      }

      const unitType = config.bookingUnitType;
      const isNightly = unitType === LINE_ITEM_NIGHT;
      const isDaily = unitType === LINE_ITEM_DAY;

      const translationKey = isNightly
        ? 'EditListingPricingForm.pricePerNight'
        : isDaily
        ? 'EditListingPricingForm.pricePerDay'
        : 'EditListingPricingForm.pricePerUnit';

      const titleMessage = intl.formatMessage({ id: 'EditListingDescriptionForm.title' });
      const titlePlaceholderMessage = intl.formatMessage({
        id: 'EditListingDescriptionForm.titlePlaceholder',
      });
      const titleRequiredMessage = intl.formatMessage({
        id: 'EditListingDescriptionForm.titleRequired',
      });
      const maxLengthMessage = intl.formatMessage(
        { id: 'EditListingDescriptionForm.maxLength' },
        {
          maxLength: TITLE_MAX_LENGTH,
        }
      );

      const descriptionMessage = intl.formatMessage({
        id: 'EditListingDescriptionForm.description',
      });
      const descriptionPlaceholderMessage = intl.formatMessage({
        id: 'EditListingDescriptionForm.descriptionPlaceholder',
      });
      const maxLength60Message = maxLength(maxLengthMessage, TITLE_MAX_LENGTH);
      const descriptionRequiredMessage = intl.formatMessage({
        id: 'EditListingDescriptionForm.descriptionRequired',
      });
      const { updateListingError, createListingDraftError, showListingsError, setStockError } =
        fetchErrors || {};
      const stockValidator = validators.numberAtLeast(
        intl.formatMessage({ id: 'EditListingPricingForm.stockIsRequired' }),
        0
      );
      const stockErrorMessage = isOldTotalMismatchStockError(setStockError)
        ? intl.formatMessage({ id: 'EditListingPricingForm.oldStockTotalWasOutOfSync' })
        : intl.formatMessage({ id: 'EditListingPricingForm.stockUpdateFailed' });
      const pricePerUnitMessage = intl.formatMessage({
        id: translationKey,
      });

      const pricePlaceholderMessage = intl.formatMessage({
        id: 'EditListingPricingForm.priceInputPlaceholder',
      });

      const priceRequired = validators.required(
        intl.formatMessage({
          id: 'EditListingPricingForm.priceRequired',
        })
      );
      const minPrice = new Money(config.listingMinimumPriceSubUnits, config.currency);
      const minPriceRequired = validators.moneySubUnitAmountAtLeast(
        intl.formatMessage(
          {
            id: 'EditListingPricingForm.priceTooLow',
          },
          {
            minPrice: formatMoney(intl, minPrice),
          }
        ),
        config.listingMinimumPriceSubUnits
      );
      const priceValidators = config.listingMinimumPriceSubUnits
        ? validators.composeValidators(priceRequired, minPriceRequired)
        : priceRequired;
      const errorMessageUpdateListing = updateListingError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingDescriptionForm.updateFailed" />
        </p>
      ) : null;

      // This error happens only on first tab (of EditListingWizard)
      const errorMessageCreateListingDraft = createListingDraftError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingDescriptionForm.createListingDraftError" />
        </p>
      ) : null;

      const errorMessageShowListing = showListingsError ? (
        <p className={css.error}>
          <FormattedMessage id="EditListingDescriptionForm.showListingFailed" />
        </p>
      ) : null;

      const classes = classNames(css.root, className);
      const submitReady = (updated && pristine) || ready;
      const submitInProgress = updateInProgress;
      const submitDisabled = invalid || disabled || submitInProgress;
      // console.log('timezone', values?.timezone);
      // console.log('timezones', values?.timezones);
      return (
        <Form className={classes} onSubmit={handleSubmit}>
          {errorMessageCreateListingDraft}
          {errorMessageUpdateListing}
          {errorMessageShowListing}
          {/* description section  */}
          <fieldset disabled={hasZoom} className={css.fieldset}>
            <FieldTextInput
              id="title"
              name="title"
              className={css.title}
              type="text"
              label="Name of class"
              placeholder="Enter name of class. e.g. Vinyasa yoga"
              maxLength={TITLE_MAX_LENGTH}
              validate={composeValidators(required(titleRequiredMessage), maxLength60Message)}
              autoFocus
            />

            <FieldTextInput
              id="description"
              name="description"
              className={css.description}
              type="textarea"
              label={descriptionMessage}
              placeholder={descriptionPlaceholderMessage}
              validate={composeValidators(required(descriptionRequiredMessage))}
            />

            <FieldSelectModern
              className={css.features}
              id="languages"
              name="languages"
              label="Language"
              options={config.custom.languages}
              placeholder="Select a language"
              validate={fieldSelectModernRequired('Please select a language')}
              isSearchable={true}
            />
            {/* features section */}
            <FieldCheckboxGroup
              className={css.features}
              id="yogaStyles"
              name="yogaStyles"
              label="Workout Type"
              options={config.custom.workoutTypes}
            />
            {values?.yogaStyles?.includes('other') ? (
              <FieldTextInput
                id="otherWorkoutType"
                name="otherWorkoutType"
                className={css.title}
                type="text"
                label="Other Workout Type"
                placeholder="Enter other workout type"
                validate={required('Please enter other workout type')}
              />
            ) : null}
            {/* pricing section  */}
            <FieldSelectModern
              className={css.features}
              id="type"
              name="type"
              label="Type"
              options={config.custom.typeOptions}
              placeholder="Select a type"
              validate={fieldSelectModernRequired('Please select a type')}
            />
            <FieldSelectModern
              className={css.features}
              id="payment_type"
              name="payment_type"
              label="Payment Type (You can select One or Both) "
              options={[
                { value: 'per_session', label: 'Per Session' },
                { value: 'recurring', label: 'Subscription' },
              ]}
              placeholder="Select payment type"
              validate={fieldSelectModernRequired('Please select a payment type')}
              isMulti
              isSearchable={true}
            />
            {values?.type?.key === config.isPaid &&
            values?.payment_type?.some(type => type.value === 'per_session') ? (
              <FieldCurrencyInput
                id="price"
                name="price"
                className={css.priceInput}
                label={pricePerUnitMessage}
                placeholder={pricePlaceholderMessage}
                currencyConfig={config.currencyConfig}
                validate={priceValidators}
                style={{ marginBottom: '32px' }}
              />
            ) : null}
            {values?.type?.key === config.isPaid &&
            values?.payment_type?.some(type => type.value === 'recurring') ? (
              <FieldCurrencyInput
                id="monthly_price"
                name="monthly_price"
                className={css.priceInput}
                label="Monthly Price"
                placeholder="Enter monthly price"
                currencyConfig={config.currencyConfig}
                validate={priceValidators}
                style={{ marginBottom: '32px' }}
              />
            ) : null}
            {/* date and availability section */}

            <FieldTextInput
              className={css.title}
              id="stock"
              name="stock"
              label="Maximum Capacity"
              placeholder="How many students can attend this class?"
              type="number"
              min={0}
              validate={stockValidator}
              onKeyDown={e => (e.keyCode === 189 || e.keyCode === 190) && e.preventDefault()}
            />
            {setStockError ? <p className={css.error}>{stockErrorMessage}</p> : null}
            {/* Recurrence section */}
            {/* {values?.payment_type?.some(type => type.value === 'recurring') && (
            <FieldSelectModern
              className={css.features}
              id="recurrence_type"
              name="recurrence_type"
              label="Recurrence Type ( Do you want the meeting to repeat? )"
              options={[
                { value: '1', label: 'Daily' },
                { value: '2', label: 'Weekly' },
                { value: '3', label: 'Monthly' },
              ]}
              placeholder="Select recurrence type"
              validate={fieldSelectModernRequired('Please select a recurrence type')}
            />
          )} */}

            {/* {values?.payment_type?.some(type => type.value === 'recurring') && (
            <>
              <FieldTextInput
                id="repeat_interval"
                name="repeat_interval"
                className={css.title}
                type="number"
                label="Repeat Interval (number of days, weeks, or months that should pass before the meeting repeats.)"
                placeholder="Enter repeat interval."
                validate={required('Please enter repeat interval')}
                min={1}
                max={maxRecurrence}
              />
              <FieldSelectModern
                className={css.features}
                id="end_recurrence"
                name="end_recurrence"
                label="End of Recurrence"
                options={[
                  { value: 'end_date', label: 'End by Date' },
                  { value: 'end_times', label: 'End after X occurrences' },
                ]}
                placeholder="Select end of recurrence"
                validate={fieldSelectModernRequired('Please select an end of recurrence')}
              />
              {values?.end_recurrence?.value === 'end_date' ? (
                <Datepicker
                  className={css.title}
                  id="end_date"
                  name="end_date"
                  label="End Date"
                  placeholder="Choose end date"
                  minDate={values?.start_date ? new Date(values.start_date) : new Date()}
                  dateFormat="MM/dd/yyyy"
                  validate={composeValidators(required('End date is required'))}
                />
              ) : null}
              {values?.end_recurrence?.value === 'end_times' ? (
                <FieldTextInput
                  id="end_times"
                  name="end_times"
                  className={css.title}
                  type="number"
                  label="Occurrences"
                  placeholder="Enter number of occurrences"
                  validate={required('Please enter number of occurrences')}
                  min={1}
                  max={60}
                />
              ) : null}
              
              {values?.recurrence_type?.value === '3' ? (
                <>
                  <FieldTextInput
                    id="monthly_day"
                    name="monthly_day"
                    className={css.title}
                    type="number"
                    label="Day of the Month"
                    placeholder="Enter day of the month"
                    min={1}
                    max={31}
                  />
                </>
              ) : null}
            </>
          )} */}
            {values?.payment_type?.some(type => type.value === 'recurring') && (
              <FieldSelectModern
                className={css.features}
                id="weekly_days"
                name="weekly_days"
                label="Days of the Week (You can select multiple days)"
                options={[
                  { value: '1', label: 'Sunday' },
                  { value: '2', label: 'Monday' },
                  { value: '3', label: 'Tuesday' },
                  { value: '4', label: 'Wednesday' },
                  { value: '5', label: 'Thursday' },
                  { value: '6', label: 'Friday' },
                  { value: '7', label: 'Saturday' },
                ]}
                isMulti
              />
            )}
            <fieldset disabled={hasZoom} className={css.fieldset}>
              <FieldSelectModern
                className={css.features}
                id="timezone"
                name="timezone"
                label="Time Zone"
                options={config.custom.timezones}
                placeholder="Select time zone"
                validate={fieldSelectModernRequired('Please select a time zone')}
                isSearchable={true}
                disabled={hasZoom}
              />
              <Datepicker
                className={css.title}
                id="start_date"
                name="start_date"
                label="Date "
                placeholder="Choose date"
                minDate={new Date()}
                onFieldChange={e => form.change('time', e)}
                dateFormat="MM/dd/yyyy "
                style={{ marginBottom: '32px' }}
                validate={composeValidators(required('Start date is required'))}
                disabled={hasZoom}
              />
              <Datepicker
                className={css.title}
                id="time"
                name="time"
                label="Time"
                placeholder="Choose time"
                minDate={new Date()}
                style={{ marginBottom: '32px' }}
                showTimeSelect
                onFieldChange={e => form.change('start_date', e)}
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="h:mm aa"
                validate={composeValidators(required('Time is required'))}
                disabled={hasZoom}
              />
              <FieldSelectModern
                className={css.features}
                id="class_duration"
                name="class_duration"
                label="Class Duration"
                options={config.custom.durationOptions}
                placeholder="Select duration"
                validate={fieldSelectModernRequired('Please select a duration')}
                isSearchable={true}
                disabled={hasZoom}
              />
            </fieldset>

            <Button
              className={css.submitButton}
              type="submit"
              inProgress={submitInProgress}
              disabled={submitDisabled}
              ready={submitReady}
            >
              {saveActionMsg}
            </Button>
          </fieldset>
        </Form>
      );
    }}
  />
);

EditListingDescriptionFormComponent.defaultProps = { className: null, fetchErrors: null };

EditListingDescriptionFormComponent.propTypes = {
  className: string,
  intl: intlShape.isRequired,
  onSubmit: func.isRequired,
  saveActionMsg: string.isRequired,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  updated: bool.isRequired,
  updateInProgress: bool.isRequired,
  fetchErrors: shape({
    createListingDraftError: propTypes.error,
    showListingsError: propTypes.error,
    updateListingError: propTypes.error,
  }),
  certificateOptions: arrayOf(
    shape({
      key: string.isRequired,
      label: string.isRequired,
    })
  ),
};

export default compose(injectIntl)(EditListingDescriptionFormComponent);
