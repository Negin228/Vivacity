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
      <div className={css.steps}>
        <div className={css.step}>
        <h2 className={css.stepTitle}>
        <FormattedMessage id="SectionWhyChooseVivacity.titleLineOne" />
        </h2>
        <p>
        <FormattedMessage id="SectionWhyChooseVivacity.titleLineTwo" />
        </p>
        </div>
      </div>         
      <div className={css.content}>
        <FormattedMessage id="SectionWhyChooseVivacity.titleLineTwo" />
      </div>
      <div className={css.content}>
        <FormattedMessage id="SectionWhyChooseVivacity.titleLineThree" />
      </div>
      <div className={css.content}>
        <FormattedMessage id="SectionWhyChooseVivacity.titleLineFour" />
      </div>
      <div className={css.content}>
        <FormattedMessage id="SectionWhyChooseVivacity.titleLineFive" />
      </div>
      <div className={css.content}>
        <FormattedMessage id="SectionWhyChooseVivacity.titleLineSix" />
      </div>
      <div className={css.content}>
        <FormattedMessage id="SectionWhyChooseVivacity.titleLineSeven" />
      </div>
      <div className={css.content}>
        <FormattedMessage id="SectionWhyChooseVivacity.titleLineEight" />
      </div>
      <div className={css.content}>
        <FormattedMessage id="SectionWhyChooseVivacity.titleLineNine" />
      </div>
      <div className={css.content}>
        <FormattedMessage id="SectionWhyChooseVivacity.titleLineTen" />
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
