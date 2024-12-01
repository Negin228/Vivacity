import React from 'react';
import { bool, string } from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { OwnListingLink } from '../../components';
import { NamedLink } from '../../components';
import css from './SectionWhyChooseVivacity.module.css';

document.addEventListener("DOMContentLoaded", () => {
  const collapsibleButtons = document.querySelectorAll(".collapsible-button");

  collapsibleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const content = button.nextElementSibling;
      content.classList.toggle("active");

      // Adjust max-height dynamically
      if (content.classList.contains("active")) {
        content.style.maxHeight = content.scrollHeight + "px";
      } else {
        content.style.maxHeight = null;
      }
    });
  });
});





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

                  <div class="collapsible-container">
                    <button class="collapsible-button">
                      <h2 className={css.contentTitle}>
                       <FormattedMessage id="SectionWhyChooseVivacity.titleLineTwo" />
                      </h2>
                    </button>
                    <div class="collapsible-content">
                      <p>
                        <FormattedMessage id="SectionWhyChooseVivacity.titleLineThree" />
                      </p>
                    </div>
                  </div>
                </div>
                <div className={css.content}>
                  <h2 className={css.contentTitle}>
                    <FormattedMessage id="SectionWhyChooseVivacity.titleLineFour" />
                  </h2>
                  <p>
                    <FormattedMessage id="SectionWhyChooseVivacity.titleLineFive" />
                  </p>
                </div>
                <div className={css.content}>
                  <h2 className={css.contentTitle}>
                    <FormattedMessage id="SectionWhyChooseVivacity.titleLineSix" />
                  </h2>
                  <p>
                    <FormattedMessage id="SectionWhyChooseVivacity.titleLineSeven" />
                  </p>
                </div>
                <div className={css.content}>
                  <h2 className={css.contentTitle}>
                    <FormattedMessage id="SectionWhyChooseVivacity.titleLineEight" />
                  </h2>
                  <p>
                    <FormattedMessage id="SectionWhyChooseVivacity.titleLineNine" />
                  </p>
                </div>
  
                <div className={css.JoinVivacityTodayLink}>
                 {routeLink('SignupPage', 'Join Vivacity Today!')}
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
