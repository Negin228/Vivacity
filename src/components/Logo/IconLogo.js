import React from 'react';
import PropTypes from 'prop-types';
import image from './saunatime-logo.png';
const IconLogo = props => {
  const { className, format, ...rest } = props;

  if (format === 'desktop') {
    return <img src={image} className={className} />;
  }

  return <img src={image} className={className} />;
};

const { string } = PropTypes;

IconLogo.defaultProps = {
  className: null,
};

IconLogo.propTypes = {
  className: string,
};

export default IconLogo;
