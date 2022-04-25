import React, { Component } from 'react';
import { Field } from 'react-final-form';
import classNames from 'classnames';
import { ValidationError } from '../../components';
import Select from 'react-select';

import css from './FieldSelectModern.module.css';

const CONTENT_MAX_LENGTH = 5000;

class FieldSelectModernComponent extends Component {
  render() {
    /* eslint-disable no-unused-vars */
    const {
      rootClassName,
      className,
      inputRootClass,
      disabled,
      customErrorText,
      id,
      label,
      input,
      meta,
      onUnmount,
      isUncontrolled,
      inputRef,
      subHeading,
      ...rest
    } = this.props;
    /* eslint-enable no-unused-vars */

    if (label && !id) {
      throw new Error('id required when a label is given');
    }

    const { valid, invalid, touched, error } = meta;
    const isTextarea = input.type === 'textarea';

    const errorText = customErrorText || error;
    const customStyles = {
      ///.....
      menuPortal: provided => ({ ...provided, zIndex: 9 }),
      menu: provided => ({ ...provided, zIndex: 9 }),
      ///.....
    };
    // Error message and input error styles are only shown if the
    // field has been touched and the validation has failed.
    const hasError = !!customErrorText || !!(touched && invalid && error);

    const fieldMeta = { touched: hasError, error: errorText };

    // Textarea doesn't need type.
    const { type, ...inputWithoutType } = input;
    // Uncontrolled input uses defaultValue instead of value.
    const { value: defaultValue, ...inputWithoutValue } = input;
    // Use inputRef if it is passed as prop.
    const refMaybe = inputRef ? { ref: inputRef } : {};

    const inputClasses =
      inputRootClass ||
      classNames(css.input, {
        [css.inputSuccess]: valid,
        [css.inputError]: hasError,
        [css.textarea]: isTextarea,
      });
    const maxLength = CONTENT_MAX_LENGTH;
    const inputProps = isTextarea
      ? {
          // className: inputClasses,
          id,
          rows: 1,
          maxLength,
          ...refMaybe,
          ...inputWithoutType,
          ...rest,
        }
      : isUncontrolled
      ? {
          // className: inputClasses,
          id,
          type,
          defaultValue,
          ...refMaybe,
          ...inputWithoutValue,
          ...rest,
        }
      : { className: inputClasses, id, type, ...refMaybe, ...input, ...rest };

    const classes = classNames(rootClassName || css.root, className);
    return (
      <div className={classes} style={disabled ? { pointerEvents: 'none', opacity: '0.4' } : {}}>
        {label ? (
          <label htmlFor={id} style={{ marginBottom: '1rem' }}>
            {label}
          </label>
        ) : null}
        <p className={css.subHeading}>{subHeading}</p>
        <Select styles={customStyles} {...inputProps} />
        <ValidationError fieldMeta={fieldMeta} />
      </div>
    );
  }
}

class FieldSelectModern extends Component {
  componentWillUnmount() {
    // Unmounting happens too late if it is done inside Field component
    // (Then Form has already registered its (new) fields and
    // changing the value without corresponding field is prohibited in Final Form
    if (this.props.onUnmount) {
      this.props.onUnmount();
    }
  }

  render() {
    return <Field component={FieldSelectModernComponent} {...this.props} />;
  }
}

export default FieldSelectModern;
