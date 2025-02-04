import React from 'react';
import AddressLinkMaybe from './AddressLinkMaybe';
import moment from 'moment-timezone';
import { convertTime } from '../../util/urlHelpers';
import css from './TransactionPanel.module.css';
import { getNextClassDate, isDateInPast } from '../../util/dates';

// Functional component as a helper to build detail card headings
const DetailCardHeadingsMaybe = props => {
  const {
    showDetailCardHeadings,
    listingTitle,
    subTitle,
    listing,
    location,
    geolocation,
    showAddress,
    startDate,
    isSubscription,
  } = props;
  const { publicData } = listing.attributes;
  console.log(isSubscription);
  console.log(subTitle);
  // const isDateInPast = (startDateString, timezone) => {
  //   const listingTime = moment.tz(startDateString, timezone);
  //   const currentTime = moment().tz(timezone);
  //   return listingTime.isBefore(currentTime);
  // };

  // const getNextClassDate = (startDate, weeklyDays, timezone) => {
  //   if (!isDateInPast(startDate, timezone) || !weeklyDays) {
  //     return null;
  //   }

  //   const now = moment().tz(timezone);
  //   const availableDays = weeklyDays.map(day => parseInt(day.value)).sort((a, b) => a - b);
  //   const currentDay = now.day() + 1;
  //   const nextDay = availableDays.find(d => d > currentDay) || availableDays[0];
  //   const daysToAdd = nextDay > currentDay ? nextDay - currentDay : 7 - currentDay + nextDay;

  //   const nextDate = now
  //     .add(daysToAdd, 'days')
  //     .hour(moment.tz(startDate, timezone).hour())
  //     .minute(moment.tz(startDate, timezone).minute());

  //   return convertTime(nextDate.format('YYYY-MM-DD HH:mm:ss'), timezone);
  // };
  const isStartDateInPast = isDateInPast(publicData?.startDate);
  const nextClass =
    isDateInPast(publicData?.startDate) && publicData?.weeklyDays?.length
      ? getNextClassDate(publicData?.startDate, publicData?.weeklyDays, publicData?.timezone)
      : null;
  return showDetailCardHeadings ? (
    <div className={css.detailCardHeadings}>
      <h2 className={css.detailCardTitle}>{listingTitle}</h2>
      <p className={css.detailCardSubtitle}>{subTitle}</p>
      {!isStartDateInPast ? (
        <p className={css.detailCardSubtitle}>
          <b>Next Class: </b> {startDate}
        </p>
      ) : null}
      {nextClass && (
        <p className={css.detailCardSubtitle}>
          <b>Next Class: </b> {nextClass}
        </p>
      )}
      <AddressLinkMaybe location={location} geolocation={geolocation} showAddress={showAddress} />
    </div>
  ) : null;
};

export default DetailCardHeadingsMaybe;
