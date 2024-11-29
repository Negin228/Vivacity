import React from 'react';
import { bool, string } from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { OwnListingLink } from '../../components';
import { NamedLink } from '../../components';
import css from './SectionWhyChooseVivacity.module.css';

const SectionWhyChooseVivacity = props => {
  const { rootClassName, className, currentUserListing, currentUserListingFetched } = props;
  const routeLink = (name, text) => {
    return (
      <NamedLink name={name}>
        <span>{text}</span>
      </NamedLink>
    );
  };
  const classes = classNames(rootClassName || css.root, className);
  return (
    <div className={classes}>
        <div className={css.content}>
          <h2 className={css.contentTitle}>
            <FormattedMessage id="SectionWhyChooseVivacity.titleLineOne" />
          </h2>
          <p>
            <FormattedMessage id="SectionWhyChooseVivacity.titleLineTwo" />
          </p>
        </div>
        <div className={css.content}>
          <h2 className={css.contentTitle}>
            <FormattedMessage id="SectionWhyChooseVivacity.titleLineThree" />
          </h2>
          <p>
            <FormattedMessage id="SectionWhyChooseVivacity.titleLineFour" />
          </p>
        </div>
          <div className={css.content}>
          <h2 className={css.contentTitle}>
            <FormattedMessage id="SectionWhyChooseVivacity.titleLineFive" />
          </h2>
          <p>
            <FormattedMessage id="SectionWhyChooseVivacity.titleLineSix" />
          </p>
        </div>
        <div className={css.content}>
          <h2 className={css.contentTitle}>
            <FormattedMessage id="SectionWhyChooseVivacity.titleLineSeven" />
          </h2>
          <p>
            <FormattedMessage id="SectionWhyChooseVivacity.titleLineEight" />
          </p>
        </div>
        <div className={css.content}>
          <h2 className={css.contentTitle}>
            <FormattedMessage id="SectionWhyChooseVivacity.titleLineNine" />
          </h2>
          <p>
            <FormattedMessage id="SectionWhyChooseVivacity.titleLineTen" />
          </p>
        </div>

  
      </div>  
  
  );
};

SectionWhyChooseVivacity.defaultProps = {
  rootClassName: null,
  className: null,
  currentUserListing: null,
  currentUserListingFetched: false,
};

SectionWhyChooseVivacity.propTypes = {
  rootClassName: string,
  className: string,
  currentUserListing: propTypes.ownListing,
  currentUserListingFetched: bool,
};

export default SectionWhyChooseVivacity;
