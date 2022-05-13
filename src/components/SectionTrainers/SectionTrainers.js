import React from 'react';
import { bool, string } from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { OwnListingLink } from '../../components';
import image from './sd.png';
import css from './SectionTrainers.module.css';

const SectionTrainers = props => {
  const {
    rootClassName,
    className,
    products,
    currentUserListing,
    currentUserListingFetched,
  } = props;
  const classes = classNames(rootClassName || css.root, className);
  let trainers = [];
  //   products.filter(product => {
  //     return product.author.attributes.profile.publicData.userType === 'teacher'
  //       ? trainers.push(product.author.attributes.profile.displayName)
  //       : null;
  //   });
  console.log('userTypeTeacher', trainers);
  return (
    <div className={classes}>
      <div className={css.title}>Our Trainers</div>

      <div className={css.steps}>
        <div className={css.step}>
          <h2 className={css.stepTitle}>
            <img src={image} style={{ borderRadius: '50%' }} />
          </h2>
          <p>SHABY B</p>
        </div>
      </div>
      {/* <div className={css.createListingLink}>
        <OwnListingLink listing={currentUserListing} listingFetched={currentUserListingFetched}>
          <FormattedMessage id="SectionHowItWorks.createListingLink" />
        </OwnListingLink>
      </div> */}
    </div>
  );
};

SectionTrainers.defaultProps = {
  rootClassName: null,
  className: null,
  currentUserListing: null,
  currentUserListingFetched: false,
};

SectionTrainers.propTypes = {
  rootClassName: string,
  className: string,
  currentUserListing: propTypes.ownListing,
  currentUserListingFetched: bool,
};

export default SectionTrainers;
