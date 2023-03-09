import React from 'react';
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
      } = formRenderProps;

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

      return (
        <Form className={classes} onSubmit={handleSubmit}>
          {errorMessageCreateListingDraft}
          {errorMessageUpdateListing}
          {errorMessageShowListing}
          {/* description section  */}
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
          {values?.type?.key === config.isPaid ? (
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
          {/* date and availability section */}
          <fieldset disabled={hasZoom} className={css.fieldset}>
            <FieldTimeZoneSelect
              id="timezone"
              name="timezone"
              label="Time Zone"
              placeholder="Select time zone"
              style={{ marginBottom: '32px' }}
              disabled={hasZoom}
            />
            <Datepicker
              className={css.title}
              id="start_date"
              name="start_date"
              label="Date and Time"
              placeholder="Choose date and time"
              minDate={new Date()}
              style={{ marginBottom: '32px' }}
              validate={composeValidators(required('Start date is required'))}
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
          <FieldTextInput
            className={css.title}
            id="stock"
            name="stock"
            label="Capacity"
            placeholder="How many students can attend this class?"
            type="number"
            min={0}
            validate={stockValidator}
            onKeyDown={e => (e.keyCode === 189 || e.keyCode === 190) && e.preventDefault()}
          />
          {setStockError ? <p className={css.error}>{stockErrorMessage}</p> : null}
          <Button
            className={css.submitButton}
            type="submit"
            inProgress={submitInProgress}
            disabled={submitDisabled}
            ready={submitReady}
          >
            {saveActionMsg}
          </Button>
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
