import React, { useState } from 'react';
import { bool, string } from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { NamedLink } from '../../components';
import css from './SectionWhyChooseVivacity.module.css';

const SectionWhyChooseVivacity = props => {
  const { rootClassName, className } = props;

  // State for collapsible sections
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleCollapsible = () => {
    setIsExpanded(!isExpanded);
  };

  const classes = classNames(rootClassName || css.root, className);

  return (
    <div className={classes}>
      <div className={css.title}>
        <FormattedMessage id="SectionWhyChooseVivacity.titleLineOne" />
      </div>

      <div className={css.content}>

  
        <div className={css.collapsibleContainer}>
          <button
            className={classNames(css.collapsibleButton, {
              [css.active]: isExpanded, // Add active class if expanded
            })}
            onClick={toggleCollapsible}
            aria-expanded={isExpanded}
          >
            <h2 className={css.contentTitle}>
              <FormattedMessage id="SectionWhyChooseVivacity.titleLineTwo" />
            </h2>
            {/* Display + or - based on isExpanded state */}
            <span className={css.collapsibleIcon}>
              {isExpanded ? '-' : '+'}
            </span>
          </button>
          <div
            className={classNames(css.collapsibleContent, {
              [css.active]: isExpanded,
            })}
            style={{
              maxHeight: isExpanded ? '200px' : '0', // Control max height for collapse/expand
              overflow: 'hidden',
            }}
          >
            <p>
              <FormattedMessage id="SectionWhyChooseVivacity.titleLineThree" />
            </p>
          </div>
        </div>
        <div className={css.collapsibleContainer}>
          <button
            className={classNames(css.collapsibleButton, {
              [css.active]: isExpanded, // Add active class if expanded
            })}
            onClick={toggleCollapsible}
            aria-expanded={isExpanded}
          >
            <h2 className={css.contentTitle}>
              <FormattedMessage id="SectionWhyChooseVivacity.titleLineFour" />
            </h2>
            {/* Display + or - based on isExpanded state */}
            <span className={css.collapsibleIcon}>
              {isExpanded ? '-' : '+'}
            </span>
          </button>
          <div
            className={classNames(css.collapsibleContent, {
              [css.active]: isExpanded,
            })}
            style={{
              maxHeight: isExpanded ? '200px' : '0', // Control max height for collapse/expand
              overflow: 'hidden',
            }}
          >
            <p>
              <FormattedMessage id="SectionWhyChooseVivacity.titleLineFive" />
            </p>
          </div>
        </div>

        <div className={css.collapsibleContainer}>
          <button
            className={classNames(css.collapsibleButton, {
              [css.active]: isExpanded, // Add active class if expanded
            })}
            onClick={toggleCollapsible}
            aria-expanded={isExpanded}
          >
            <h2 className={css.contentTitle}>
              <FormattedMessage id="SectionWhyChooseVivacity.titleLineSix" />
            </h2>
            {/* Display + or - based on isExpanded state */}
            <span className={css.collapsibleIcon}>
              {isExpanded ? '-' : '+'}
            </span>
          </button>
          <div
            className={classNames(css.collapsibleContent, {
              [css.active]: isExpanded,
            })}
            style={{
              maxHeight: isExpanded ? '200px' : '0', // Control max height for collapse/expand
              overflow: 'hidden',
            }}
          >
            <p>
              <FormattedMessage id="SectionWhyChooseVivacity.titleLineSeven" />
            </p>
          </div>
        </div>

                    <div className={css.collapsibleContainer}>
          <button
            className={classNames(css.collapsibleButton, {
              [css.active]: isExpanded, // Add active class if expanded
            })}
            onClick={toggleCollapsible}
            aria-expanded={isExpanded}
          >
            <h2 className={css.contentTitle}>
              <FormattedMessage id="SectionWhyChooseVivacity.titleLineEight" />
            </h2>
            {/* Display + or - based on isExpanded state */}
            <span className={css.collapsibleIcon}>
              {isExpanded ? '-' : '+'}
            </span>
          </button>
          <div
            className={classNames(css.collapsibleContent, {
              [css.active]: isExpanded,
            })}
            style={{
              maxHeight: isExpanded ? '200px' : '0', // Control max height for collapse/expand
              overflow: 'hidden',
            }}
          >
            <p>
              <FormattedMessage id="SectionWhyChooseVivacity.titleLineNine" />
            </p>
          </div>
        </div>
            
            
      </div>

      <div className={css.JoinVivacityTodayLink}>
        <NamedLink name="SignupPage">
          <span>Join Vivacity Today!</span>
        </NamedLink>
      </div>
    </div>
  );
};

SectionWhyChooseVivacity.defaultProps = {
  rootClassName: null,
  className: null,
};

SectionWhyChooseVivacity.propTypes = {
  rootClassName: string,
  className: string,
};

export default SectionWhyChooseVivacity;
