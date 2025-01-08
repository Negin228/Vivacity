import moment, { utc } from 'moment';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { ResponsiveImage } from '../../components';
import { formatMoney } from '../../util/currency';
import { convertDate, convertTime, convertTimeOnly, createSlug } from '../../util/urlHelpers';
import css from './ProductCard.module.css';
import { AiFillStar } from 'react-icons/ai';
import classNames from 'classnames';
import mt from 'moment-timezone';
function ProductCard({
  title,
  id,
  timeZone,
  startDate,
  startDateString,
  images,
  teacherName,
  publicData,
}) {
  const history = useHistory();
  const handleClick = () =>
    history.push({
      pathname: `/l/${createSlug(title)}/${id}`,
    });
  const { paymentType = [] } = publicData || {};
  const isRecurring = paymentType?.some(type => type.value === 'recurring');
  const isDateInPast = (startDateString, timezone) => {
    const listingTime = moment.tz(startDateString, timezone);
    const currentTime = moment().tz(timezone);
    return listingTime.isBefore(currentTime);
  };

  const getNextClassDate = (startDate, weeklyDays, timezone) => {
    if (!isDateInPast(startDate, timezone) || !weeklyDays) {
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
  const formattedDate = convertDate(startDateString, timeZone);
  const formattedTime = convertTimeOnly(startDateString, timeZone);
  // const startDate = publicData?.startDate;
  const timezone = publicData?.timezone;
  const weeklyDays = publicData?.weeklyDays;
  const targetTime = convertTime(startDateString, timeZone);
  if (!targetTime) return null;
  return (
    <div className={css.product} onClick={handleClick}>
      {/* <div className="px-3 flex items-center justify-between">
        <h4 className="my-0 truncate font-semibold capitalize mr-4 w-28">{authorName}</h4>
        <p className={css.price}>{formattedPrice}</p>
      </div> */}

      <div className={classNames(css.productImageWrapper, 'relative')}>
        <ResponsiveImage
          rootClassName={css.rootForImage}
          alt={title}
          image={images?.[0]}
          variants={['square-small2x']}
        />
      </div>
      <div className={css.productBodyWrapper}>
        {/* <div className={css.productPrice}>
          <div className={css.co2Container}>
            <p className={css.price}>{formattedPrice}</p>
          </div>
        </div> */}

        <div>
          {isRecurring && weeklyDays && weeklyDays.length > 0 ? (
            <>
              <p className={css.classDate}>
                {weeklyDays
                  .sort((a, b) => parseInt(a.value) - parseInt(b.value))
                  .map(x => x.label)
                  .join(', ')}{' '}
                every week.
              </p>
            </>
          ) : !isRecurring ? (
            <p className={css.classDate}>
              {startDate && timezone
                ? isDateInPast(startDate, timezone)
                  ? getNextClassDate(startDate, weeklyDays, timezone)
                  : targetTime
                : 'Date not available'}
            </p>
          ) : null}
          <p className={css.price}>
            {title} with {teacherName}
          </p>
        </div>

        {/* <p>{description}</p> */}
      </div>
    </div>
  );
}

export default ProductCard;
