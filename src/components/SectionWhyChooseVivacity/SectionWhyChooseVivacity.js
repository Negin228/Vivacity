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
      <div className={css.title}>
        <FormattedMessage id="SectionWhyChooseVivacity.titleLineOne" />
      </div>         
      <div className={css.content}>
        <FormattedMessage id="SectionWhyChooseVivacity.titleLineTwo" />
      </div>
      <div className={css.content}>
        <FormattedMessage id="SecSectionWhyChooseVivacity.titleLineThree" />
      </div>

      <div className={css.steps}>
        <div className={css.step}>
          <h2 className={css.stepTitle}>
            <FormattedMessage id="SectionWhyChooseVivacity.part1Title" />
          </h2>
          <p>
            Start by {routeLink('SignupPage', 'signing up')} as a student. Then browse our catalogue and find the live online workout class that fits in your schedule. Simply book the session and enjoy! All our classes are live, engaging, and most importantly, fun!
          </p>
        </div>

        <div className={css.step}>
          <h2 className={css.stepTitle}>
            <FormattedMessage id="SectionWhyChooseVivacity.part2Title" />
          </h2>
          <p>
            <FormattedMessage id="SectionWhyChooseVivacity.part2Text" />
          </p>
        </div>

        <div className={css.step}>
          <h2 className={css.stepTitle}>
            <FormattedMessage id="SectionWhyChooseVivacity.part3Title" />
          </h2>
          <p>
            <FormattedMessage id="SectionWhyChooseVivacity.part3Text" />
          </p>
        </div>
      </div>
      <div className={css.createListingLink}>
        {routeLink('SearchPage', 'Are you an instructor? Schedule a class!')}
        {/* <FormattedMessage id="SectionWhyChooseVivacity.createListingLink" /> */}
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
