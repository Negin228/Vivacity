import React, { useEffect } from 'react';
import { bool, string } from 'prop-types';
import classNames from 'classnames';
import { propTypes } from '../../util/types';
import image from './no-profile-pic.png';
import css from './SectionTrainers.module.css';

const SectionTrainers = props => {
  const { rootClassName, className, trainers, trainersLoading, trainersError } = props;
  const classes = classNames(rootClassName || css.root, className);

  return (
    <div className={classes}>
      <div className={css.title}>Our Trainers</div>
      <div className={css.steps}>
        {trainers?.map(trainer => (
          <>
            <div className={css.step}>
              <img
                src={trainer.trainerProfileImage ? trainer.trainerProfileImage : image}
                style={{ width: '60%', borderRadius: '50%', height: '50%' }}
              />
              <h2 className={css.stepTitle}>{trainer.trainerName}</h2>
            </div>
          </>
        ))}
      </div>
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
