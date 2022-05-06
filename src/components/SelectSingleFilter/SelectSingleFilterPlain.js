import React, { Component, useMemo, useState } from 'react';
import { arrayOf, bool, func, node, object, shape, string } from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from '../../util/reactIntl';

import css from './SelectSingleFilterPlain.module.css';

const getQueryParamName = queryParamNames => {
  return Array.isArray(queryParamNames) ? queryParamNames[0] : queryParamNames;
};

const SelectSingleFilterPlain = props => {
  const toggleIsOpen = () => {
    this.setState({ isOpen: !this.state.isOpen });
  };
  const {
    rootClassName,
    className,
    label,
    options,
    queryParamNames,
    initialValues,
    twoColumns,
    onSelect,
    useBullets,
  } = props;
  const [keyword, setKeyword] = useState('');
  const [keywordOptions, setkeywordOptions] = useState(options);
  const [isOpen, onToggleActive] = useState(true);
  const optionLabel = (options, key) => {
    const option = options.find(o => o.key === key);
    return option ? option.label : key;
  };
  const selectOption = (queryParamName, option, e) => {
    if (option == null) {
      setKeyword('');
    }
    onSelect({ [queryParamName]: option });
    if (e && e.currentTarget) {
      e.currentTarget.blur();
    }
  };
  const getQueryParamName = queryParamNames => {
    return Array.isArray(queryParamNames) ? queryParamNames[0] : queryParamNames;
  };
  const SortSearchArray = (arr, query) => {
    return arr.sort((arr1, arr2) => {
      let str1 = arr1.label.toLowerCase();
      let str2 = arr2.label.toLowerCase();
      let calc1 = 0;
      let calc2 = 0;
      for (let i = 0; i < query.length; ++i) {
        if (str1[i]) {
          if (str1[i] == query[i]) {
            calc1++;
          }
        }
        if (str2[i]) {
          if (str2[i] == query[i]) {
            calc2++;
          }
        }
      }
      if (calc1 > calc2) {
        return -1;
      } else if (calc2 > calc1) {
        return 1;
      } else {
        if (str1.length > str2.length) {
          return 1;
        } else {
          return -1;
        }
      }
    });
  };
  let filterKeywordOptions = [...(keywordOptions ?? [])];
  filterKeywordOptions = useMemo(() => {
    if (keyword !== '') {
      let results = [...filterKeywordOptions].filter(item => {
        return (
          String(item.label)
            .toLowerCase()
            .indexOf(keyword.toLowerCase().trim()) > -1
        );
      });

      return SortSearchArray(results, keyword.toLowerCase().trim());
    } else {
      return keywordOptions;
    }
  }, [keyword, keywordOptions]);

  const hasBullets = useBullets || twoColumns;
  const getOptions = () => {
    return filterKeywordOptions?.length > 0
      ? [...new Set([...(filterKeywordOptions || [])])].slice(0, 10)
      : keywordOptions.slice(0, 5);
  };
  const classes = classNames(rootClassName || css.root, className);
  const languageFilterPlaceholderMessage = `Enter ${label}`;
  return (
    <div className={classes}>
      <div
        className={
          (initialValues && initialValues[getQueryParamName(queryParamNames)]
          ? initialValues[getQueryParamName(queryParamNames)]
          : null)
            ? css.filterLabelSelected
            : css.filterLabel
        }
      >
        <button className={css.labelButton} onClick={() => onToggleActive(!isOpen)}>
          <span
            className={
              (initialValues && initialValues[getQueryParamName(queryParamNames)]
              ? initialValues[getQueryParamName(queryParamNames)]
              : null)
                ? css.filterLabelSelected
                : css.filterLabel
            }
          >
            {label}
          </span>
        </button>
        <button
          className={css.clearButton}
          onClick={e => selectOption(getQueryParamName(queryParamNames), null, e)}
        >
          <FormattedMessage id={'SelectSingleFilter.plainClear'} />
        </button>
        <input
          type="text"
          className={css.inputTextItem}
          value={keyword}
          placeholder={languageFilterPlaceholderMessage}
          onChange={e => setKeyword(e.target.value)}
        />
      </div>
      <div
        className={classNames({
          [css.optionsContainerOpen]: isOpen,
          [css.optionsContainerClosed]: !isOpen,
          [css.hasBullets]: useBullets || twoColumns,
          [css.twoColumns]: twoColumns,
        })}
      >
        {getOptions().map(option => {
          // check if this option is selected
          const selected =
            (initialValues && initialValues[getQueryParamName(queryParamNames)]
              ? initialValues[getQueryParamName(queryParamNames)]
              : null) === option.key;
          const optionClass =
            (useBullets || twoColumns) && selected ? css.optionSelected : css.option;
          // menu item selected bullet or border class
          const optionBorderClass =
            useBullets || twoColumns
              ? classNames({
                  [css.optionBulletSelected]: selected,
                  [css.optionBullet]: !selected,
                })
              : classNames({
                  [css.optionBorderSelected]: selected,
                  [css.optionBorder]: !selected,
                });
          return (
            <button
              key={option.key}
              className={optionClass}
              onClick={e => selectOption(getQueryParamName(queryParamNames), option.key, e)}
            >
              <span className={optionBorderClass} />
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

SelectSingleFilterPlain.defaultProps = {
  rootClassName: null,
  className: null,
  initialValues: null,
  twoColumns: false,
  useBullets: false,
};

SelectSingleFilterPlain.propTypes = {
  rootClassName: string,
  className: string,
  queryParamNames: arrayOf(string).isRequired,
  label: node.isRequired,
  onSelect: func.isRequired,

  options: arrayOf(
    shape({
      key: string.isRequired,
      label: string.isRequired,
    })
  ).isRequired,
  initialValues: object,
  twoColumns: bool,
  useBullets: bool,
};

export default SelectSingleFilterPlain;
