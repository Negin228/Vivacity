import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form as FinalForm, Field } from 'react-final-form';
import classNames from 'classnames';
import { intlShape, injectIntl } from '../../util/reactIntl';
import { FieldTextInput, Form, LocationAutocompleteInput, PrimaryButton } from '../../components';
import { isMainSearchTypeKeywords } from '../../util/search';
import css from './TopbarSearchForm.module.css';
import IconSearchDesktop from './IconSearchDesktop';
const identity = v => v;

const KeywordSearchField = props => {
  const { keywordSearchWrapperClasses, iconClass, intl, isMobile, inputRef } = props;
  return (
    <div className={keywordSearchWrapperClasses}>
      <button className={css.searchSubmit}>
        <div className={iconClass}>
          <IconSearchDesktop />
        </div>
      </button>
      <Field
        name="keywords"
        render={({ input, meta }) => {
          return (
            <input
              className={isMobile ? css.mobileInput : css.desktopInput}
              {...input}
              id="keyword-search"
              ref={inputRef}
              type="text"
              placeholder={intl.formatMessage({
                id: 'TopbarSearchForm.placeholder',
              })}
              autoComplete="off"
            />
          );
        }}
      />
    </div>
  );
};

class TopbarSearchFormComponent extends Component {
  constructor(props) {
    super(props);
    // onChange is used for location search
    this.onChange = this.onChange.bind(this);
    // onSubmit is used for keywords search
    this.onSubmit = this.onSubmit.bind(this);

    // Callback ref
    this.searchInput = null;
    this.setSearchInputRef = element => {
      this.setSearchInput = element;
    };
  }

  onChange(location) {
    const { appConfig, onSubmit } = this.props;
    if (!isMainSearchTypeKeywords(appConfig) && location.selectedPlace) {
      // Note that we use `onSubmit` instead of the conventional
      // `handleSubmit` prop for submitting. We want to autosubmit
      // when a place is selected, and don't require any extra
      // validations for the form.
      onSubmit({ location });
      // blur search input to hide software keyboard
      this.searchInput?.blur();
    }
  }

  onSubmit(values) {
    const { appConfig, onSubmit } = this.props;
    if (isMainSearchTypeKeywords(appConfig)) {
      onSubmit({ keywords: values.keywords });
      // blur search input to hide software keyboard
      this.searchInput?.blur();
    }
  }

  render() {
    const { onSubmit, appConfig, ...restOfProps } = this.props;
    const isKeywordsSearch = isMainSearchTypeKeywords(appConfig);
    const submit = isKeywordsSearch ? this.onSubmit : onSubmit;
    return (
      <FinalForm
        {...restOfProps}
        onSubmit={submit}
        render={formRenderProps => {
          const {
            rootClassName,
            className,
            desktopInputRoot,
            intl,
            isMobile,
            handleSubmit,
          } = formRenderProps;
          const classes = classNames(rootClassName, className);
          const desktopInputRootClass = desktopInputRoot || css.desktopInputRoot;

          // Location search: allow form submit only when the place has changed
          const preventFormSubmit = e => e.preventDefault();
          const submitFormFn = isKeywordsSearch ? handleSubmit : preventFormSubmit;

          const keywordSearchWrapperClasses = classNames(
            css.keywordSearchWrapper,
            isMobile ? css.mobileInputRoot : desktopInputRootClass
          );

          return (
            <Form className={classes} onSubmit={submitFormFn} enforcePagePreloadFor="SearchPage">
              <KeywordSearchField
                keywordSearchWrapperClasses={keywordSearchWrapperClasses}
                iconClass={classNames(isMobile ? css.mobileIcon : css.desktopIcon || css.icon)}
                intl={intl}
                isMobile={isMobile}
                inputRef={this.setSearchInputRef}
              />
            </Form>
          );
        }}
      />
    );
  }
}

const { func, string, bool } = PropTypes;

TopbarSearchFormComponent.defaultProps = {
  rootClassName: null,
  className: null,
  desktopInputRoot: null,
  isMobile: false,
};

TopbarSearchFormComponent.propTypes = {
  rootClassName: string,
  className: string,
  desktopInputRoot: string,
  onSubmit: func.isRequired,
  isMobile: bool,

  // from injectIntl
  intl: intlShape.isRequired,
};

const TopbarSearchForm = injectIntl(TopbarSearchFormComponent);

export default TopbarSearchForm;
