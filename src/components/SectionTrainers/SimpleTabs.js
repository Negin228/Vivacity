import React from 'react';
import PropTypes from 'prop-types';
import css from './SimpleTabs.module.css';

const SimpleTabs = ({ trainers, image, onImageClick }) => {
  return (
    <div className={css.tabsContainer}>
      {trainers.map(trainer => (
        <div key={trainer.id} className={css.trainer}>
          <img
            src={trainer.image || image}
            alt={trainer.name}
            className={css.image}
            onClick={() => onImageClick(trainer)}
          />
          <div className={css.trainerName}>{trainer.name}</div>
        </div>
      ))}
    </div>
  );
};

SimpleTabs.propTypes = {
  trainers: PropTypes.array.isRequired,
  image: PropTypes.string.isRequired,
  onImageClick: PropTypes.func.isRequired,
};

export default SimpleTabs;
