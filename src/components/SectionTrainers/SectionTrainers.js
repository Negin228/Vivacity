import React, { useState, useEffect, useRef } from 'react';
import { bool, string } from 'prop-types';
import classNames from 'classnames';
import { propTypes } from '../../util/types';
import image from './no-profile-pic.png';
import css from './SectionTrainers.module.css';
import { BsArrowLeftCircle, BsArrowRightCircle } from 'react-icons/bs';
import { IconSpinner } from '../../components';
import SimpleTabs from './SimpleTabs';

const SectionTrainers = props => {
  const { rootClassName, className, trainers, loading, error } = props;
  const classes = classNames(rootClassName || css.root, className);
  if (error || trainers?.length === 0) {
    return (
      <div>
        <div className={css.title} style={{ marginBottom: '30px' }}>
          Our Trainers
        </div>
        <span style={{ color: '#4a4a4a' }}>
          Failed to load trainers. Please refresh the page to fix the problem.
        </span>
      </div>
    );
  }
  if (loading) {
    return (
      <div className={css.loadingContainer}>
        <p>
          <IconSpinner style={{ style: { height: '50px', width: '50px' } }} />
        </p>
      </div>
    );
  }

  return (
    <div className={classes}>
      <div className={css.title}>Our Trainers</div>
      <SimpleTabs trainers={trainers} image={image} style={css.hey} container={css.container} />
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
