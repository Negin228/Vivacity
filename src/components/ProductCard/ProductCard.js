import moment from 'moment';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { ResponsiveImage } from '../../components';
import { formatMoney } from '../../util/currency';
import { createSlug } from '../../util/urlHelpers';
import css from './ProductCard.module.css';
import { AiFillStar } from 'react-icons/ai';
import classNames from 'classnames';
import mt from 'moment-timezone';
function ProductCard({ title, id, timeZone, startDate, price, images, intl, teacherName }) {
  const history = useHistory();
  const handleClick = () =>
    history.push({
      pathname: `/l/${createSlug(title)}/${id}`,
    });
  const newStartDate = new Date(startDate);
  const formattedDate = moment(newStartDate).format('dddd, MMMM Do');
  const formattedTime = moment(newStartDate).format('h:mm a');
  const timezoneOffset = mt.tz(timeZone).format('Z');
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
          <h3>
            {formattedDate} at {formattedTime} GMT {timezoneOffset}
          </h3>
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
