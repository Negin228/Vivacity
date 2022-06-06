import React, { Component } from 'react';
import { array, bool, func, object, string } from 'prop-types';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';
import { LISTING_STATE_DRAFT } from '../../util/types';
import { EditListingPhotosForm } from '../../forms';
import { ensureOwnListing } from '../../util/data';
import { ListingLink, Modal } from '../../components';

import css from './EditListingPhotosPanel.module.css';
import { withRouter } from 'react-router-dom';
import ExternalLink from '../ExternalLink/ExternalLink';
import ZoomPopupModal from './ZoomPopupModal';

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

    return (
      <div className={classes}>
        <h1 className={css.title}>{panelTitle}</h1>
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

            const shouldShowZoomModal = doesntHaveZoom || timeUpdated;

            if (shouldShowZoomModal) {
              this.setState({
                publishData: updateValues,
                zoomModalOpen: true,
              });
            } else {
              onSubmit(updateValues);
            }
          }}
          onChange={onChange}
          onUpdateImageOrder={onUpdateImageOrder}
          onRemoveImage={onRemoveImage}
          saveActionMsg={submitButtonText}
          updated={panelUpdated}
          updateInProgress={updateInProgress}
        />
        {/* {modal} */}
        <ZoomPopupModal
          open={this.state.zoomModalOpen}
          onClose={() => this.setState({ zoomModalOpen: false })}
        />
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
