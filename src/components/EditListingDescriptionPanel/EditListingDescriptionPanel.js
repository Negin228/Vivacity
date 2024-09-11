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
import { types as sdkTypes } from '../../util/sdkLoader';
const { Money } = sdkTypes;
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
    currentUser,
  } = props;
  const firstName = currentUser?.attributes?.profile?.firstName;
  const lastName = currentUser?.attributes?.profile?.lastName;
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : null;
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
        price: publicData.type === config.isPaid ? price : null,
        timezone: publicData.timezone
          ? config.custom.timezones?.find(i => i.key == publicData?.timezone)
          : undefined,
        // timezone: publicData.timezone ? publicData.timezone : undefined,
        start_date: publicData.startDateString ? new Date(publicData.startDateString) : undefined,
        time: publicData.startDateString ? new Date(publicData.startDateString) : undefined,
        stock: currentStock,
        class_duration: publicData.classDuration ? publicData.classDuration : undefined,
        type: config.custom.typeOptions?.find(option => option.key === publicData.type),
        otherWorkoutType: publicData.otherWorkoutType,
        recurrence_type: publicData.recurrenceType,
        repeat_interval: publicData.repeatInterval,
        end_recurrence: publicData.endRecurrence,
        end_date: publicData.endDate ? new Date(publicData.endDate) : undefined,
        end_times: publicData.endTimes,
        weekly_days: publicData.weeklyDays,
        monthly_day: publicData.monthlyDay,
        
      };
    }
    return {
      title,
      description,
      languages: publicData.languages,
      yogaStyles: yogaStyles || [],
      price: publicData.type === config.isPaid ? price : null,
      timezone: publicData.timezone
        ? config.custom.timezones?.find(i => i.key == publicData?.timezone)
        : undefined,
      // timezone: publicData.timezone ? publicData.timezone : undefined,
      start_date: publicData.startDateString ? new Date(publicData.startDateString) : undefined,
      stock: currentStock,
      class_duration: publicData.classDuration ? publicData.classDuration : undefined,
      type: config.custom.typeOptions?.find(option => option.key === publicData.type),
      otherWorkoutType: publicData.otherWorkoutType,
      time: publicData.startDateString ? new Date(publicData.startDateString) : undefined,
      recurrence_type: publicData.recurrenceType,
      repeat_interval: publicData.repeatInterval,
      end_recurrence: publicData.endRecurrence,
      end_date: publicData.endDate ? new Date(publicData.endDate) : undefined,
      end_times: publicData.endTimes,
      weekly_days: publicData.weeklyDays,
      monthly_day: publicData.monthlyDay,
      
      ...initialProps,
    };
  }, [initialProps]);

  const hasZoom = currentListing?.attributes?.privateData?.zoom;

  return (
    <div className={classes}>
      <h1 className={css.title}>{panelTitle}</h1>
      <EditListingDescriptionForm
        className={css.form}
        initialValues={initialValues}
        hasZoom={hasZoom}
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
            type,
            otherWorkoutType,
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
          const selectedDate = moment(startDateISO).tz(timezone?.key);
          const unix_time_stamp = selectedDate.unix();

          const yogaStylesFilter = yogaStyles?.map(
            style => config.custom.workoutTypes?.find(s => s.key === style)?.label
          );
          const startDateString = moment(start_date).format('YYYY-MM-DD HH:mm:ss');
          const startDateUnix = moment.tz(startDateString, timezone?.key).unix();

          const startDateToIso = moment.unix(startDateUnix).toISOString();

          const priceMaybe =
            type?.key === config.isPaid ? { price } : { price: new Money(0, config.currency) };
          const updateValues = {
            ...stockUpdateMaybe,
            title: title,
            description,
            availabilityPlan: {
              type: 'availability-plan/time',
              timezone: timezone?.key,
              entries: [
                // { dayOfWeek: 'mon', startTime: '09:00', endTime: '17:00', seats: 1 },
                // { dayOfWeek: 'tue', startTime: '09:00', endTime: '17:00', seats: 1 },
                // { dayOfWeek: 'wed', startTime: '09:00', endTime: '17:00', seats: 1 },
                // { dayOfWeek: 'thu', startTime: '09:00', endTime: '17:00', seats: 1 },
                // { dayOfWeek: 'fri', startTime: '09:00', endTime: '17:00', seats: 1 },
                // { dayOfWeek: 'sat', startTime: '09:00', endTime: '17:00', seats: 1 },
                // { dayOfWeek: 'sun', startTime: '09:00', endTime: '17:00', seats: 1 },
              ],
            },
            // price: type?.key === config.isPaid ? price : null,
            ...priceMaybe,
            publicData: {
              languages: languages,
              languagesFilter: [languages.key],
              yogaStyles: yogaStyles,
              timezone: hasZoom ? publicData?.timezone : timezone?.key,
              startDate: hasZoom ? publicData?.startDate : startDateToIso,
              stock: stock,
              classDuration: hasZoom ? publicData?.classDuration : class_duration,
              unixTimeStamp: hasZoom ? publicData?.unixTimeStamp : startDateUnix,
              classDurationFilter: hasZoom ? publicData?.classDurationFilter : [class_duration.key],
              timeUpdated,
              type: type?.key,
              otherWorkoutType: yogaStyles?.includes('other') ? otherWorkoutType : null,
              yogaStylesFilter: fullName + yogaStylesFilter?.toString(),
              startDateString,
              recurrenceType: values.recurrence_type,
              repeatInterval: values.repeat_interval,
              endRecurrence: values.end_recurrence,
              endDate: values.end_date ? values.end_date.toISOString() : undefined,
              endTimes: values.end_times,
              weeklyDays: values.weekly_days,
              monthlyDay: values.monthly_day,
              
            },
          };
          setInitialProps({
            ...updateValues,
            title,
            description,
            languages,
            yogaStyles,
            price,
            timezone: hasZoom ? publicData?.timezone : timezone,
            start_date: hasZoom ? new Date(publicData?.startDate) : start_date,
            stock,
            class_duration: hasZoom ? publicData.classDuration : class_duration,
            type,
            otherWorkoutType,
            time: hasZoom ? new Date(publicData?.startDate) : start_date,
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
