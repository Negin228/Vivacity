import React from 'react';
import { bool, func, object, string } from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from '../../util/reactIntl';
import { ensureOwnListing } from '../../util/data';
import { findOptionsForSelectFilter } from '../../util/search';
import { LISTING_STATE_DRAFT } from '../../util/types';
import { ListingLink } from '../../components';
import { EditListingDescriptionForm } from '../../forms';
import config from '../../config';
import moment from 'moment';
import css from './EditListingDescriptionPanel.module.css';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { clearPreviousListingData } from '../../containers/EditListingPage/EditListingPage.duck';

const EditListingDescriptionPanel = props => {
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
  const dispatch = useDispatch();
  React.useEffect(() => {
    if (dispatch && clearPreviousListingData) {
      dispatch(clearPreviousListingData());
    }
  }, []);
  const [initialProps, setInitialProps] = React.useState({});
  const classes = classNames(rootClassName || css.root, className);
  const currentListing = ensureOwnListing(listing);
  const { description, title, price, publicData } = currentListing.attributes;
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
  const yogaStyles = publicData && publicData.yogaStyles;

  const initialValues = React.useMemo(() => {
    if (!initialProps) {
      return {
        title,
        description,
        languages: publicData.languages,
        yogaStyles: yogaStyles || [],
        price: price,
        timezone: publicData.timezone ? publicData.timezone : undefined,
        start_date: publicData.startDate ? new Date(publicData.startDate) : undefined,
        stock: currentStock,
        class_duration: publicData.classDuration ? publicData.classDuration : undefined,
      };
    }
    return {
      title,
      description,
      languages: publicData.languages,
      yogaStyles: yogaStyles || [],
      price: price,
      timezone: publicData.timezone ? publicData.timezone : undefined,
      start_date: publicData.startDate ? new Date(publicData.startDate) : undefined,
      stock: currentStock,
      class_duration: publicData.classDuration ? publicData.classDuration : undefined,
      ...initialProps,
    };
  }, [initialProps]);

  return (
    <div className={classes}>
      <h1 className={css.title}>{panelTitle}</h1>
      <EditListingDescriptionForm
        className={css.form}
        initialValues={initialValues}
        saveActionMsg={submitButtonText}
        onSubmit={values => {
          const {
            title,
            description,
            languages,
            yogaStyles = [],
            price,
            timezone,
            start_date,
            stock,
            class_duration,
          } = values;
          const hasStockQuantityChanged = stock && currentStockRaw !== stock;
          const oldTotal = currentStockRaw != null ? currentStockRaw : null;

          const timeUpdated =
            new Date(values.start_date).toISOString() != publicData?.startDate ||
            publicData?.classDuration?.key != values?.class_duration?.key;

          const stockUpdateMaybe = hasStockQuantityChanged
            ? {
                stockUpdate: {
                  oldTotal,
                  newTotal: parseInt(stock),
                },
              }
            : {};
          const startDateISO = start_date.toISOString();
          const selectedDate = moment(startDateISO).tz(timezone);
          const unix_time_stamp = selectedDate.unix();
          const updateValues = {
            ...stockUpdateMaybe,
            title: title,
            description,
            price: price,
            publicData: {
              languages: languages,
              languagesFilter: [languages.key],
              yogaStyles: yogaStyles,
              timezone: timezone,
              startDate: start_date.toISOString(),
              stock: stock,
              classDuration: class_duration,
              unixTimeStamp: unix_time_stamp,
              classDurationFilter: [class_duration.key],
              timeUpdated,
            },
          };
          setInitialProps({
            ...updateValues,
            title,
            description,
            languages,
            yogaStyles,
            price,
            timezone,
            start_date,
            stock,
            class_duration,
          });

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

EditListingDescriptionPanel.defaultProps = {
  className: null,
  rootClassName: null,
  errors: null,
  listing: null,
};

EditListingDescriptionPanel.propTypes = {
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

export default EditListingDescriptionPanel;
