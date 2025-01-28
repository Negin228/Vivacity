import React, { Component } from 'react';
import { array, string, func } from 'prop-types';
import { FormattedMessage, intlShape, injectIntl } from '../../util/reactIntl';
import classNames from 'classnames';
import { lazyLoadWithDimensions } from '../../util/contextHelpers';
import { LINE_ITEM_DAY, LINE_ITEM_NIGHT, propTypes } from '../../util/types';
import { formatMoney } from '../../util/currency';
import { ensureListing } from '../../util/data';
import { richText } from '../../util/richText';
import { findOptionsForSelectFilter } from '../../util/search';
import { createSlug } from '../../util/urlHelpers';
import config from '../../config';
import { NamedLink, ResponsiveImage } from '../../components';
import { types as sdkTypes } from '../../util/sdkLoader';
import css from './ListingCard.module.css';

const MIN_LENGTH_FOR_LONG_WORDS = 10;
const { Money } = sdkTypes;
const priceData = (price, intl) => {
  if (price && price.currency === config.currency) {
    const formattedPrice = formatMoney(intl, price);
    return { formattedPrice, priceTitle: formattedPrice };
  } else if (price) {
    return {
      formattedPrice: intl.formatMessage(
        { id: 'ListingCard.unsupportedPrice' },
        { currency: price.currency }
      ),
      priceTitle: intl.formatMessage(
        { id: 'ListingCard.unsupportedPriceTitle' },
        { currency: price.currency }
      ),
    };
  }
  return {};
};

const getCertificateInfo = (certificateOptions, key) => {
  return certificateOptions.find(c => c.key === key);
};

class ListingImage extends Component {
  render() {
    return <ResponsiveImage {...this.props} />;
  }
}
const LazyImage = lazyLoadWithDimensions(ListingImage, { loadAfterInitialRendering: 3000 });

export const ListingCardComponent = props => {
  const {
    className,
    rootClassName,
    intl,
    listing,
    renderSizes,
    filtersConfig,
    setActiveListing,
  } = props;
  const classes = classNames(rootClassName || css.root, className);
  const currentListing = ensureListing(listing);
  const id = currentListing.id.uuid;
  const { title = '', price, publicData } = currentListing.attributes;
  const slug = createSlug(title);
  const firstImage =
    currentListing.images && currentListing.images.length > 0 ? currentListing.images[0] : null;
  const { type, paymentType = [], monthlyPrice } = publicData ?? {};
  const isFree = type === 'free';
  const isRecurring = paymentType?.some(type => type.value === 'recurring');
  const isPerSession = paymentType?.some(type => type.value === 'perSession');
  const hasBoth =
    paymentType?.length === 2 &&
    paymentType.some(type => type.value === 'recurring') &&
    paymentType.some(type => type.value === 'per_session');
  const weeklyDays = publicData?.weeklyDays;
  const certificateOptions = findOptionsForSelectFilter('certificate', filtersConfig);
  const certificate = publicData
    ? getCertificateInfo(certificateOptions, publicData.certificate)
    : null;
  const { formattedPrice, priceTitle } = priceData(price, intl);
  const monthlyPriceFormatted =
    isRecurring && monthlyPrice ? formatMoney(intl, new Money(monthlyPrice, config.currency)) : '';
  const unitType = config.bookingUnitType;
  const isNightly = unitType === LINE_ITEM_NIGHT;
  const isDaily = unitType === LINE_ITEM_DAY;

  const unitTranslationKey = isNightly
    ? 'ListingCard.perNight'
    : isDaily
    ? 'ListingCard.perDay'
    : 'ListingCard.perUnit';

  return (
    <NamedLink className={classes} name="ListingPage" params={{ id, slug }}>
      <div
        className={css.threeToTwoWrapper}
        onMouseEnter={() => setActiveListing(currentListing.id)}
        onMouseLeave={() => setActiveListing(null)}
      >
        <div className={css.aspectWrapper}>
          <LazyImage
            rootClassName={css.rootForImage}
            alt={title}
            image={firstImage}
            variants={['landscape-crop', 'landscape-crop2x']}
            sizes={renderSizes}
          />
        </div>
      </div>
      <div className={css.info}>
        {isFree ? (
          <div className={css.price}>
            <div className={css.priceValue} title={priceTitle}>
              <FormattedMessage id="ListingCard.free" />
            </div>
            <div className={css.perUnit}>{/* <FormattedMessage id={unitTranslationKey} /> */}</div>
          </div>
        ) : (
          <div className={css.price}>
            <div className={css.priceValue} title={priceTitle}>
              {isRecurring ? monthlyPriceFormatted : formattedPrice}
            </div>
            <div className={css.perUnit}>
              {hasBoth ? (
                <FormattedMessage id={unitTranslationKey} />
              ) : isRecurring ? (
                'per month'
              ) : (
                <FormattedMessage id={unitTranslationKey} />
              )}
            </div>
          </div>
        )}
        <div className={css.mainInfo}>
          <div className={css.title}>
            {richText(title, {
              longWordMinLength: MIN_LENGTH_FOR_LONG_WORDS,
              longWordClass: css.longWord,
            })}
          </div>
          <div className={css.certificateInfo}>
            {certificate && !certificate.hideFromListingInfo ? (
              <span>{certificate.label}</span>
            ) : null}
          </div>
        </div>
      </div>
    </NamedLink>
  );
};

ListingCardComponent.defaultProps = {
  className: null,
  rootClassName: null,
  renderSizes: null,
  filtersConfig: config.custom.filters,
  setActiveListing: () => null,
};

ListingCardComponent.propTypes = {
  className: string,
  rootClassName: string,
  filtersConfig: array,
  intl: intlShape.isRequired,
  listing: propTypes.listing.isRequired,

  // Responsive image sizes hint
  renderSizes: string,

  setActiveListing: func,
};

export default injectIntl(ListingCardComponent);
