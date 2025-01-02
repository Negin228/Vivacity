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
const SectionFeaturesMaybe = props => {
  const { options, publicData } = props;
  if (!publicData) {
    return null;
  }

  const isDateInPast = (startDateString, timezone) => {
    const listingTime = moment.tz(startDateString, timezone);
    const currentTime = moment().tz(timezone);
    return listingTime.isBefore(currentTime);
  };

  const getNextClassDate = (startDate, weeklyDays, timezone) => {
    if (!isDateInPast(startDate, timezone)) {
      return null;
    }

    const now = moment().tz(timezone);
    const availableDays = weeklyDays.map(day => parseInt(day.value)).sort((a, b) => a - b);
    const currentDay = now.day() + 1;
    const nextDay = availableDays.find(d => d > currentDay) || availableDays[0];
    const daysToAdd = nextDay > currentDay ? nextDay - currentDay : 7 - currentDay + nextDay;

    const nextDate = now
      .add(daysToAdd, 'days')
      .hour(moment.tz(startDate, timezone).hour())
      .minute(moment.tz(startDate, timezone).minute());

    return convertTime(nextDate.format('YYYY-MM-DD HH:mm:ss'), timezone);
  };

  const nextClass = isDateInPast(publicData.startDate, publicData.timezone)
    ? getNextClassDate(publicData.startDate, publicData.weeklyDays, publicData.timezone)
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
      <h2 className={css.featuresTitle} style={{ marginTop: '16px' }}>
        <MdDateRange style={{ marginRight: '10px' }} />
        Start Date
      </h2>
      <p>{targetTime}</p>
      {nextClass && (
        <>
          <h2 className={css.featuresTitle} style={{ marginTop: '16px' }}>
            <MdDateRange style={{ marginRight: '10px' }} />
            Next Class
          </h2>
          <p>{nextClass}</p>
        </>
      )}
      {isRecurring && (
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
            every week.
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
