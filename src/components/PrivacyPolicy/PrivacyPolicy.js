import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import css from './PrivacyPolicy.module.css';

const PrivacyPolicy = props => {
  const { rootClassName, className } = props;
  const classes = classNames(rootClassName || css.root, className);

  // prettier-ignore
  return (
    <div className={classes}>
      {/* <p className={css.lastUpdated}>Last updated: November 22, 2019</p> */}

      <p>
        <b>No Shows and Missed Classes</b>: If you cannot make a class, every effort will be made to catch you up in the next class, however, credit for missed classes cannot be given. You can send an email to <a href="mailto:contact@vivacity.studio">contact@vivacity.studio</a>
      </p>
      <p>
        <b>Refunds</b>: Since each class size is predetermined, refunds are not permitted.
      </p>
      <p>
        <b>Instructor no-shows</b>: In the rare occasions when an instructor is not able to join the class, we make sure that all the registration fees are refunded.
      </p>

      
    </div>
  );
};

PrivacyPolicy.defaultProps = {
  rootClassName: null,
  className: null,
};

const { string } = PropTypes;

PrivacyPolicy.propTypes = {
  rootClassName: string,
  className: string,
};

export default PrivacyPolicy;
