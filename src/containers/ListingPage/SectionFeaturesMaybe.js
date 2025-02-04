import React from 'react';
import { FormattedMessage } from '../../util/reactIntl';
import { PropertyGroup } from '../../components';
import moment from 'moment';
import css from './ListingPage.module.css';
import { CgGym } from 'react-icons/cg';
import { MdDateRange, MdAccessTime } from 'react-icons/md';
import config from '../../config';
// import moment from 'moment';
import 'moment-timezone';
import { convertTime } from '../../util/urlHelpers';
import { getNextClassDate, isDateInPast } from '../../util/dates';
const SectionFeaturesMaybe = props => {
  const { options, publicData } = props;
  if (!publicData) {
    return null;
  }

  // const isDateInPast = (startDateString, timezone) => {
  //   const listingTime = moment.tz(startDateString, timezone);
  //   const currentTime = moment().tz(timezone);
  //   return listingTime.isBefore(currentTime);
  // };
  const isStartDateInPast = isDateInPast(publicData.startDate);
  const nextClass = isDateInPast(publicData.startDate)
    ? getNextClassDate(publicData.startDate, publicData?.weeklyDays, publicData.timezone)
    : null;
  const weeklyDays = publicData?.weeklyDays;
  const isRecurring = publicData?.paymentType?.some(type => type.value === 'recurring');
  console.log(weeklyDays, 'weeklyDays');
  const selectedOptions = publicData && publicData.yogaStyles ? publicData.yogaStyles : [];
  const otherWorkoutType = publicData?.otherWorkoutType;
  const selectedConfigOptions = config.custom.workoutTypesListing.filter(o =>
    selectedOptions.find(s => s === o.key)
  );

  // ;
  const targetTime = convertTime(publicData?.startDateString, publicData.timezone);
  const formattedDate = moment(publicData.startDate)
    .tz(publicData.timezone, true)
    .local()
    .format('dddd, MMMM Do YYYY, h:mm a');
  return (
    <div className={css.sectionFeatures}>
      <h2 className={css.featuresTitle}>
        <CgGym style={{ marginRight: '10px' }} />
        Workouts
      </h2>

      <PropertyGroup
        id="ListingPage.yogaStyles"
        options={[
          ...selectedConfigOptions,
          otherWorkoutType
            ? {
                key: 'other',
                label: otherWorkoutType,
              }
            : {},
        ]}
        selectedOptions={[...selectedOptions, otherWorkoutType ? 'other' : '']}
        twoColumns={selectedConfigOptions.length > 5}
      />
      {!isStartDateInPast ? (
        <>
          <h2 className={css.featuresTitle} style={{ marginTop: '16px' }}>
            <MdDateRange style={{ marginRight: '10px' }} />
            Start Date
          </h2>
          <p>{targetTime}</p>
        </>
      ) : null}
      {nextClass && (
        <>
          <h2 className={css.featuresTitle} style={{ marginTop: '16px' }}>
            <MdDateRange style={{ marginRight: '10px' }} />
            Next Class
          </h2>
          <p>{nextClass}</p>
        </>
      )}
      {isRecurring && weeklyDays && weeklyDays.length > 0 && (
        <>
          <h2 className={css.featuresTitle} style={{ marginTop: '16px' }}>
            <MdDateRange style={{ marginRight: '10px' }} />
            Weekly Days
          </h2>
          <p>
            {weeklyDays
              .sort((a, b) => parseInt(a.value) - parseInt(b.value))
              .map(x => x.label)
              .join(', ')}{' '}
            <span className={css.weekLabel}>every week.</span>
          </p>
        </>
      )}

      {/* <p>{formattedDate}</p> */}
      <h2 className={css.featuresTitle} style={{ marginTop: '16px' }}>
        <MdAccessTime style={{ marginRight: '10px' }} />
        Class Duration
      </h2>
      <p>{publicData.classDuration?.label}</p>
    </div>
  );
};

export default SectionFeaturesMaybe;
