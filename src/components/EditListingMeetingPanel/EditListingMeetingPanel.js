import React, { useState } from 'react';
import { bool, func, object, string } from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from '../../util/reactIntl';
import { ensureOwnListing } from '../../util/data';

import { LISTING_STATE_DRAFT } from '../../util/types';
import { ListingLink } from '../../components';
import { EditListingMeetingForm } from '../../forms';

import moment from 'moment';
import css from './EditListingMeetingPanel.module.css';
import ZoomPopupModal from '../EditListingPhotosPanel/ZoomPopupModal';

const EditListingMeetingPanel = props => {
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
  const [zoomModalOpen, setZoomModalOpen] = useState(false);

  const classes = classNames(rootClassName || css.root, className);
  const currentListing = ensureOwnListing(listing);
  const { publicData } = currentListing.attributes;
  const isPublished = currentListing.id && currentListing.attributes.state !== LISTING_STATE_DRAFT;
  const panelTitle = isPublished ? (
    <FormattedMessage
      id="EditListingMeetingPanel.title"
      values={{
        listingTitle: '',
      }}
    />
  ) : (
    <FormattedMessage id="EditListingMeetingPanel.createListingTitle" />
  );

  const doesntHaveZoom = !(
    currentListing?.attributes?.privateData?.zoom?.join_url &&
    currentListing?.attributes?.privateData?.zoom?.start_url
  );

  return (
    <div className={classes}>
      <h1 className={css.title}>{panelTitle}</h1>

      <EditListingMeetingForm
        className={css.form}
        allFieldsDisabled={!doesntHaveZoom}
        initialValues={{
          timezone: publicData.timezone ? publicData.timezone : undefined,
          start_date: publicData.startDate ? new Date(publicData.startDate) : undefined,
          class_duration: publicData.classDuration ? publicData.classDuration : undefined,
        }}
        saveActionMsg={submitButtonText}
        onSubmit={values => {
          const { timezone, start_date, class_duration } = values;

          // const timeUpdated =
          //   new Date(values.start_date).toISOString() != publicData?.startDate ||
          //   publicData?.classDuration?.key != values?.class_duration?.key;

          const startDateISO = start_date.toISOString();
          const selectedDate = moment(startDateISO).tz(timezone);
          const unix_time_stamp = selectedDate.unix();
          const updateValues = {
            publicData: {
              timezone: publicData?.timezone ?? timezone,
              startDate: publicData?.startDate ?? start_date.toISOString(),
              classDuration: publicData?.classDuration ?? class_duration,
              unixTimeStamp: publicData?.unixTimeStamp ?? unix_time_stamp,
              classDurationFilter: publicData?.classDurationFilter ?? [class_duration.key],
            },
          };

          onSubmit(updateValues).then(res => {});
        }}
        onChange={onChange}
        disabled={disabled}
        ready={ready}
        updated={panelUpdated}
        updateInProgress={updateInProgress}
        fetchErrors={errors}
      />
      {/* <ZoomPopupModal open={zoomModalOpen} onClose={() => setZoomModalOpen(false)} /> */}
    </div>
  );
};

EditListingMeetingPanel.defaultProps = {
  className: null,
  rootClassName: null,
  errors: null,
  listing: null,
};

EditListingMeetingPanel.propTypes = {
  className: string,
  rootClassName: string,

  // We cannot use propTypes.listing since the listing might be a draft.
  listing: object,

  disabled: bool.isRequired,
  ready: bool.isRequired,
  onSubmit: func.isRequired,
  onChange: func.isRequired,
  submitButtonText: string.isRequired,
  panelUpdated: bool.isRequired,
  updateInProgress: bool.isRequired,
  errors: object.isRequired,
};

export default EditListingMeetingPanel;
