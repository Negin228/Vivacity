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
import css from './EditListingMeetingForm.module.css';
import { types as sdkTypes } from '../../util/sdkLoader';

const TITLE_MAX_LENGTH = 60;

const { Money } = sdkTypes;

const EditListingMeetingFormComponent = props => (
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
        allFieldsDisabled,
      } = formRenderProps;

      console.log(allFieldsDisabled);

      const { updateListingError, createListingDraftError, showListingsError, setStockError } =
        fetchErrors || {};

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

          <fieldset disabled={allFieldsDisabled} className={css.fieldset}>
            <FieldTimeZoneSelect
              id="timezone"
              name="timezone"
              label="Time Zone"
              placeholder="Select time zone"
              style={{ marginBottom: '32px' }}
            />
            <Datepicker
              className={css.title}
              id="start_date"
              name="start_date"
              label="Start Date"
              placeholder="Enter start date"
              minDate={new Date()}
              style={{ marginBottom: '32px' }}
              validate={composeValidators(required('Start date is required'))}
              disabled={allFieldsDisabled}
            />
            <FieldSelectModern
              className={css.features}
              id="class_duration"
              name="class_duration"
              label="Duration Of Class"
              options={config.custom.durationOptions}
              placeholder="Select duration"
              validate={fieldSelectModernRequired('Please select a duration')}
              isSearchable={true}
              disabled={allFieldsDisabled}
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
        </Form>
      );
    }}
  />
);

EditListingMeetingFormComponent.defaultProps = { className: null, fetchErrors: null };

EditListingMeetingFormComponent.propTypes = {
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

export default compose(injectIntl)(EditListingMeetingFormComponent);
