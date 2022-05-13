import React from 'react';
import { bool, func, object, string } from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from '../../util/reactIntl';
import { ensureOwnListing } from '../../util/data';
import { findOptionsForSelectFilter } from '../../util/search';
import { LISTING_STATE_DRAFT } from '../../util/types';
import { ListingLink } from '../../components';
import { EditListingAvailabilityPlanForm } from '../../forms';
import config from '../../config';
import moment from 'moment';
import css from './EditListingAvailabilityPanel.module.css';

const EditListingAvailabilityPanel = props => {
  const {
    className,
    rootClassName,
    listing,
    disabled,
    ready,
    onSubmit,
    onChange,
    submitButtonText,
    panelUpdated,
    updateInProgress,
    errors,
  } = props;

  const classes = classNames(rootClassName || css.root, className);
  const currentListing = ensureOwnListing(listing);
  const { description, title, publicData } = currentListing.attributes;
  const currentStockRaw = currentListing.currentStock?.attributes?.quantity;
  const currentStock = typeof currentStockRaw != null ? currentStockRaw : 1;
  const isPublished = currentListing.id && currentListing.attributes.state !== LISTING_STATE_DRAFT;
  const panelTitle = isPublished ? (
    <FormattedMessage
      id="EditListingDescriptionPanel.title"
      values={{
        listingTitle: (
          <ListingLink listing={listing}>
            <FormattedMessage id="EditListingDescriptionPanel.listingTitle" />
          </ListingLink>
        ),
      }}
    />
  ) : (
    <FormattedMessage id="EditListingDescriptionPanel.createListingTitle" />
  );

  // const certificateOptions = findOptionsForSelectFilter('certificate', config.custom.filters);
  return (
    <div className={classes}>
      <h1 className={css.title}>Add Class Date</h1>
      <EditListingAvailabilityPlanForm
        className={css.form}
        initialValues={{
          timezone: publicData.timezone ? publicData.timezone : undefined,
          start_date: publicData.startDate ? new Date(publicData.startDate) : undefined,
          stock: currentStock,
          class_duration: publicData.classDuration ? publicData.classDuration : undefined,
        }}
        saveActionMsg={submitButtonText}
        onSubmit={values => {
          const { timezone, start_date, stock, class_duration } = values;
          const hasStockQuantityChanged = stock && currentStockRaw !== stock;
          const oldTotal = currentStockRaw != null ? currentStockRaw : null;
          const stockUpdateMaybe = hasStockQuantityChanged
            ? {
                stockUpdate: {
                  oldTotal,
                  newTotal: stock,
                },
              }
            : {};
          const startDateISO = start_date.toISOString();
          const selectedDate = moment(startDateISO).tz(timezone);
          const unix_time_stamp = selectedDate.unix();
          const updateValues = {
            ...stockUpdateMaybe,
            publicData: {
              timezone: timezone,
              startDate: start_date.toISOString(),
              stock: stock,
              classDuration: class_duration,
              unixTimeStamp: unix_time_stamp,
              classDurationFilter: [class_duration.key],
            },
          };

          onSubmit(updateValues);
        }}
        onChange={onChange}
        disabled={disabled}
        ready={ready}
        updated={panelUpdated}
        updateInProgress={updateInProgress}
        fetchErrors={errors}
      />
    </div>
  );
};

EditListingAvailabilityPanel.defaultProps = {
  className: null,
  rootClassName: null,
  listing: null,
  availabilityExceptions: [],
};

EditListingAvailabilityPanel.propTypes = {
  className: string,
  rootClassName: string,

  // We cannot use propTypes.listing since the listing might be a draft.
  listing: object,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  fetchExceptionsInProgress: bool.isRequired,
  onAddAvailabilityException: func.isRequired,
  onDeleteAvailabilityException: func.isRequired,
  onSubmit: func.isRequired,
  onManageDisableScrolling: func.isRequired,
  onNextTab: func.isRequired,
  submitButtonText: string.isRequired,
  updateInProgress: bool.isRequired,
  errors: object.isRequired,
};

export default EditListingAvailabilityPanel;
