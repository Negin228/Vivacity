import React from 'react';
import PropTypes from 'prop-types';
import image from './saunatime-logo.png';
const IconLogo = props => {
  const { className, format, from, ...rest } = props;

  if (format === 'desktop') {
    return (
      <img src={image} className={className} style={from === 'footer' ? { width: '63px' } : {}} />
    );
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
