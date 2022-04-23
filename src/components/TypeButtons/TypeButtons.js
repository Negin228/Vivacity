import React, { useState, useEffect } from 'react';
import classNames from 'classnames';

import css from './TypeButtons.module.css';

const TypeButtons = props => {
  const { userTypeConfig, changeForm, formValues, type } = props;
  // const [active, setActive] = useState(null);
  // useEffect(() => {
  //   if (type) {
  //     setActive(type);
  //   }
  // }, [type]);
  const typeButtons = userTypeConfig.map(item => {
    const classes =
      formValues?.userType === item.key
        ? classNames(css.typeButtonActive, css.typeButton)
        : css.typeButton;
    return (
      <div className={classes} key={item.key} onClick={() => changeForm(item.key)}>
        {item.label}
      </div>
    );
  });
  return userTypeConfig ? <div className={css.userTypeButtons}>{typeButtons}</div> : null;
};

export default TypeButtons;
