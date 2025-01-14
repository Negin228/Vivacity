import React, { Component } from 'react';
import { array, bool, func, object, string } from 'prop-types';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { LISTING_STATE_DRAFT } from '../../util/types';
import { EditListingPhotosForm } from '../../forms';
import { ensureOwnListing } from '../../util/data';
import { ListingLink, Modal, NamedLink } from '../../components';

import css from './EditListingPhotosPanel.module.css';
import { withRouter } from 'react-router-dom';
import ExternalLink from '../ExternalLink/ExternalLink';
import ZoomPopupModal from './ZoomPopupModal';
import AddMoreMeetings from '../../containers/addMoreMeetings/AddMoreMeetings';
import moment from 'moment';

const ROOT_API_URL =
  process.env.REACT_APP_CANONICAL_ROOT_URL === 'http://localhost:3000'
    ? 'http://localhost:3500'
    : process.env.REACT_APP_CANONICAL_ROOT_URL;

class EditListingPhotosPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      publishData: {},
    };
  }

  render() {
    const {
      className,
      rootClassName,
      errors,
      disabled,
      ready,
      images,
      listing,
      onImageUpload,
      onUpdateImageOrder,
      submitButtonText,
      panelUpdated,
      updateInProgress,
      onChange,
      onSubmit,
      onRemoveImage,
      location,
    } = this.props;

    const rootClass = rootClassName || css.root;
    const classes = classNames(rootClass, className);
    const currentListing = ensureOwnListing(listing);
    const isRecurring = currentListing?.attributes?.publicData?.paymentType.some(
      type => type.value === 'recurring'
    );
    const isRecurringAndPublished = isRecurring && currentListing.attributes.state === 'published';
    const isPublished =
      currentListing.id && currentListing.attributes.state !== LISTING_STATE_DRAFT;
    const panelTitle = isPublished ? (
      <FormattedMessage
        id="EditListingPhotosPanel.title"
        values={{
          listingTitle: (
            <ListingLink listing={listing}>
              <FormattedMessage id="EditListingPhotosPanel.listingTitle" />
            </ListingLink>
          ),
        }}
      />
    ) : (
      <FormattedMessage id="EditListingPhotosPanel.createListingTitle" />
    );

    const currentListingId = currentListing?.id?.uuid;
    const timeUpdated = currentListing?.attributes?.publicData?.timeUpdated;

    const doesntHaveZoom = !(
      currentListing?.attributes?.privateData?.zoom?.join_url &&
      currentListing?.attributes?.privateData?.zoom?.start_url
    );

    // const currentPath = location.pathname;
    // const modalContent = (
    //   <div>
    //     <h2>Zoom Meeting</h2>
    //     <p className="leading-snug">
    //       In order to publish this listing, you need to authorize us via zoom so that we can
    //       schedule a meeting on your behalf.
    //     </p>

    //     <ExternalLink
    //       href={`https://zoom.us/oauth/authorize?response_type=code&client_id=${process.env.REACT_APP_ZOOM_CLIENT_ID}&redirect_uri=http://localhost:3500/api/auth/callback/zoom?backurl=${currentPath}`}
    //       target="_self"
    //     >
    //       Continue with zoom login
    //     </ExternalLink>
    //   </div>
    // );

    // const modal = (
    //   <Modal
    //     id="Zoom-Modal"
    //     name="Zoom-Modal"
    //     isOpen={this.state.zoomModalOpen}
    //     onClose={() => this.setState({ zoomModalOpen: false })}
    //     onManageDisableScrolling={() => {}}
    //     usePortal
    //   >
    //     {modalContent}
    //   </Modal>
    // );
    const getZoomUrls = listing => {
      const zoomData = listing?.attributes?.privateData?.zoom;
      if (!zoomData) return null;

      // Handle old format
      if (zoomData.start_url || zoomData.join_url) {
        return {
          start_url: zoomData.start_url,
          join_url: zoomData.join_url,
        };
      }

      // Handle new series format - get first series
      if (zoomData.series?.[0]) {
        return {
          start_url: zoomData.series[0].start_url,
          join_url: zoomData.series[0].join_url,
        };
      }

      return null;
    };
    const doesNotHaveZoom = !getZoomUrls(currentListing);

    const currentPath = location.pathname;
    const isWithinOneYear = () => {
      const lastClass = listing?.attributes?.publicData?.lastClass;
      if (!lastClass) return false;

      const lastClassDate = moment.unix(lastClass);
      const oneYearFromNow = moment().add(1, 'year');
      return lastClassDate.isBefore(oneYearFromNow);
    };
    const zoomMeetingScheduleContent = (
      <div>
        <h1>Zoom Meeting</h1>
        <p className="leading-snug">
          {isRecurring && (
            <>
              By authorizing with Zoom, you'll be creating a 6-month series of recurring meetings in
              your zoom account. Your students can subscribe to these classes on a monthly basis.
              When your class schedule is nearing its end, you can easily extend the meetings for
              another 6 months by updating your class with the "Extend Meetings" button which will
              be available here after you publish the class.{' '}
            </>
          )}
          In order to proceed further, you need to authorize us via Zoom so that we can schedule
          meetings on your behalf.
        </p>

        <ExternalLink
          href={`https://zoom.us/oauth/authorize?response_type=code&client_id=${process.env.REACT_APP_ZOOM_CLIENT_ID}&redirect_uri=${ROOT_API_URL}/api/auth/callback/zoom?backurl=${currentPath}`}
          target="_self"
        >
          Continue with Zoom login
        </ExternalLink>
      </div>
    );

    const zoomUrls = getZoomUrls(currentListing);
    const startUrl = zoomUrls?.start_url;
    const joinUrl = zoomUrls?.join_url;

    const zoomContent = startUrl && joinUrl && (
      <div className="bg-green-100 mb-8 max-w-lg text-green-700 border border-solid border-green-300 rounded p-4 inline-block">
        <h2 className="my-0 text-lg">
          {' '}
          Scheduled Zoom meeting
          {listing?.attributes?.publicData &&
            (isRecurring
              ? listing?.attributes?.publicData?.lastClass &&
                ` (End date: ${moment
                  .unix(listing.attributes.publicData.lastClass)
                  .format('MMM DD, YYYY')})`
              : listing?.attributes?.publicData?.startDate &&
                ` (Start date: ${moment(listing.attributes.publicData.startDate).format(
                  'MMM DD, YYYY'
                )})`)}
          {isRecurring && listing?.attributes?.publicData?.lastClass && (
            <>
              <p className="text-sm mt-2">
                Your class meetings are scheduled until{' '}
                {moment.unix(listing.attributes.publicData.lastClass).format('MMM DD, YYYY')}.
              </p>
              <p className="text-sm mt-1">
                {listing.attributes.state === 'published'
                  ? isWithinOneYear()
                    ? 'You can extend your meetings for 6 more months using the button below when they are about to expire.'
                    : 'The option to extend meetings will be available when your meetings are within one year of expiry.'
                  : 'The option to extend meetings will be available after you publish your class.'}
              </p>
            </>
          )}
        </h2>
        <div className="my-0 text-sm flex gap-3  mt-2">
          <span>Start URL:</span>{' '}
          <ExternalLink href={startUrl} className="break-words">
            {startUrl?.slice(0, 40) + '...'}
          </ExternalLink>
        </div>
        <div className="my-0 text-sm flex gap-3">
          <span>Join URL:</span>
          {'  '}
          <ExternalLink href={joinUrl} className="break-words">
            {joinUrl?.slice(0, 40) + '...'}
          </ExternalLink>
        </div>
        {isRecurringAndPublished && isWithinOneYear() && (
          <AddMoreMeetings listing={listing} location={location} />
        )}
        {isRecurring && (
          <p className="text-sm mt-2 text-gray-600">
            Need help? Please <NamedLink name="ContactPage">contact the site admin</NamedLink> for
            assistance.
          </p>
        )}
      </div>
    );

    return (
      <div className={classes}>
        {doesNotHaveZoom ? (
          zoomMeetingScheduleContent
        ) : (
          <>
            <h1 className={css.title}>{panelTitle}</h1>

            {zoomContent}
            <EditListingPhotosForm
              className={css.form}
              disabled={disabled}
              ready={ready}
              fetchErrors={errors}
              currentListingId={currentListingId}
              initialValues={{ images }}
              images={images}
              onImageUpload={onImageUpload}
              onSubmit={values => {
                const { addImage, ...updateValues } = values;
                // onSubmit(updateValues);

                // const shouldShowZoomModal = doesntHaveZoom || timeUpdated;

                // if (shouldShowZoomModal) {
                //   this.setState({
                //     publishData: updateValues,
                //     zoomModalOpen: true,
                //   });
                // } else {
                onSubmit(updateValues);
                // }
              }}
              onChange={onChange}
              onUpdateImageOrder={onUpdateImageOrder}
              onRemoveImage={onRemoveImage}
              saveActionMsg={submitButtonText}
              updated={panelUpdated}
              updateInProgress={updateInProgress}
            />
          </>
        )}
        {/* {modal} */}
        {/* <ZoomPopupModal
          open={this.state.zoomModalOpen}
          onClose={() => this.setState({ zoomModalOpen: false })}
        /> */}
      </div>
    );
  }
}

EditListingPhotosPanel.defaultProps = {
  className: null,
  rootClassName: null,
  errors: null,
  images: [],
  listing: null,
};

EditListingPhotosPanel.propTypes = {
  className: string,
  rootClassName: string,
  errors: object,
  disabled: bool.isRequired,
  ready: bool.isRequired,
  images: array,

  // We cannot use propTypes.listing since the listing might be a draft.
  listing: object,

  onImageUpload: func.isRequired,
  onUpdateImageOrder: func.isRequired,
  onSubmit: func.isRequired,
  onChange: func.isRequired,
  submitButtonText: string.isRequired,
  panelUpdated: bool.isRequired,
  updateInProgress: bool.isRequired,
  onRemoveImage: func.isRequired,
};

export default withRouter(EditListingPhotosPanel);
