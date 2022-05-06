import React, { Component, useState, useMemo, useEffect } from 'react';
import { arrayOf, func, node, number, object, shape, string } from 'prop-types';
import { FormattedMessage } from '../../util/reactIntl';
import classNames from 'classnames';

import { Menu, MenuContent, MenuItem, MenuLabel } from '..';
import css from './SelectSingleFilterPopup.module.css';

const optionLabel = (options, key) => {
  const option = options.find(o => o.key === key);
  return option ? option.label : key;
};

const getQueryParamName = queryParamNames => {
  return Array.isArray(queryParamNames) ? queryParamNames[0] : queryParamNames;
};

const SelectSingleFilterPopup = props => {
  const {
    rootClassName,
    className,
    label,
    options,
    queryParamNames,
    onSelect,
    initialValues,
    contentPlacementOffset,
  } = props;
  const [keyword, setKeyword] = useState('');
  const [keywordOptions, setkeywordOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, onToggleActive] = useState(false);
  const getQueryParamName = queryParamNames => {
    return Array.isArray(queryParamNames) ? queryParamNames[0] : queryParamNames;
  };
  const languageFilterPlaceholderMessage = `Enter ${label}`;
  const queryParamName = getQueryParamName(queryParamNames);
  const initialValue =
    initialValues && initialValues[queryParamNames] ? initialValues[queryParamNames] : null;

  // resolve menu label text and class
  const optionLabel = (options, key) => {
    const option = options.find(o => o.key === key);
    return option ? option.label : key;
  };
  const menuLabel = initialValue ? optionLabel(options, initialValue) : label;
  const menuLabelClass = initialValue ? css.menuLabelSelected : css.menuLabel;

  const classes = classNames(rootClassName || css.root, className);
  const selectOption = (queryParamName, option) => {
    if (option == null) {
      setKeyword('');
    }
    onToggleActive(false);
    onSelect({ [queryParamName]: option });
  };

  useEffect(() => {
    setLoading(false);
    const languages = options;

    setkeywordOptions(languages);
  }, []);
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

  const getOptions = () => {
    return filterKeywordOptions?.length > 0
      ? [...new Set([...(filterKeywordOptions || [])])].slice(0, 8)
      : keywordOptions.slice(0, 5);
  };
  return (
    <Menu
      className={classes}
      useArrow={false}
      contentPlacementOffset={contentPlacementOffset}
      onToggleActive={onToggleActive}
      isOpen={isOpen}
    >
      <MenuLabel className={menuLabelClass}>{menuLabel}</MenuLabel>
      <MenuContent
        className={css.menuContent}
        style={{ paddingLeft: '18px', paddingRight: '18px' }}
      >
        <MenuItem className={css.menuItemInput} key={'inputArea'}>
          <input
            type="text"
            className={css.inputTextItem}
            value={keyword}
            placeholder={languageFilterPlaceholderMessage}
            onChange={e => setKeyword(e.target.value)}
          />
        </MenuItem>
        {getOptions().map(option => {
          // check if this option is selected
          const selected =
            (initialValues && initialValues[queryParamNames]
              ? initialValues[queryParamNames]
              : null) === option.key;
          // menu item border class
          const menuItemBorderClass = selected ? css.menuItemBorderSelected : css.menuItemBorder;

          return (
            <MenuItem key={option.key}>
              <button
                className={css.menuItem}
                onClick={() => selectOption(getQueryParamName(queryParamNames), option.key)}
              >
                <span className={menuItemBorderClass} />
                {option.label}
              </button>
            </MenuItem>
          );
        })}
        <MenuItem key={'clearLink'}>
          <button className={css.clearMenuItem} onClick={() => selectOption(queryParamName, null)}>
            <FormattedMessage id={'SelectSingleFilter.popupClear'} />
          </button>
        </MenuItem>
      </MenuContent>
    </Menu>
  );
};

SelectSingleFilterPopup.defaultProps = {
  rootClassName: null,
  className: null,
  initialValues: null,
  contentPlacementOffset: 0,
};

SelectSingleFilterPopup.propTypes = {
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
  contentPlacementOffset: number,
};

export default SelectSingleFilterPopup;
