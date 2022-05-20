import classNames from 'classnames';
import React from 'react';
import { Field } from 'react-final-form';
function Input({ input, noLabel, borderRedOnError, ...rest }) {
  const { label, placeholder, meta, customErrorText } = rest;

  // console.log(rest);

  const { valid, invalid, touched, error } = meta;
  const isTextarea = input.type === 'textarea';

  const errorText = customErrorText || error;

  // Error message and input error styles are only shown if the
  // field has been touched and the validation has failed.
  const hasError = !!customErrorText || !!(touched && invalid && error);

  return (
    <React.Fragment>
      {noLabel ? null : (
        <label className="font-sans mb-2 mt-2 ml-1 text-md" htmlFor="firstName">
          {label}
        </label>
      )}
      {isTextarea ? (
        <div className="shadow-sm group-hover:border-gray-400 focus-within:border-gray-400 border-2 border-gray-200 border-solid hover:border-gray-400 transition-all duration-200 focus:border-gray-400  rounded-md px-6 py-2">
          <textarea
            cols={1}
            row={2}
            placeholder={placeholder}
            className="border-none resize-none text-lg"
            {...input}
          ></textarea>
        </div>
      ) : input.type == 'number' ? (
        <input
          type="text"
          min={1}
          placeholder={placeholder}
          onClick={e => e.target.focus()}
          onMouseUp={e => e.target.blur()}
          className={`border-2 shadow-sm border-gray-200 ${
            borderRedOnError ? (hasError && errorText ? 'border-red-400' : '') : ''
          } text-lg border-solid hover:border-gray-400 transition-all duration-200 focus:border-gray-400  rounded-md px-6 py-3 md:py-2`}
          {...input}
        />
      ) : (
        <input
          type="text"
          placeholder={placeholder}
          className={`border-2 shadow-sm border-gray-200 ${
            borderRedOnError ? (hasError && errorText ? 'border-red-400' : '') : ''
          } text-lg border-solid hover:border-gray-400 transition-all duration-200 focus:border-gray-400  rounded-md px-6 py-3 md:py-2`}
          {...input}
        />
      )}
      {!borderRedOnError && hasError && errorText ? (
        <div className="text-md text-red-400 mt-2">{errorText}</div>
      ) : null}
    </React.Fragment>
  );
}

function FieldInput(props) {
  return <Field component={Input} {...props} />;
}

export default FieldInput;
