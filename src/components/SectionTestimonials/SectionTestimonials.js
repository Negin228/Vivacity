import React from 'react';
import { bool, string } from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { OwnListingLink } from '../../components';
import { NamedLink } from '../../components';
import css from './SectionTestimonials.module.css';

const SectionTestimonials = props => {
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
        <P> What Do Vivacity Students Say?
      </div>         
      <div className={css.content}>
        <P> We value feedback from our students. Here's what they shared with us.</P>
      </div>

      <div className={css.steps}>
        <div className={css.step}>
          <h2 className={css.stepTitle}>Clarissa Peterson</h2>
        </div>

        <div className={css.step}>
          <h2 className={css.stepTitle}>
            <P> Love the Energy </P>
          </h2>
          <p> This is the best class I have ever attended </p>
        </div>

        <div className={css.step}>
          <h2 className={css.stepTitle}>Couldnt be happier</h2>
          <p>Best ever teacher. Loved it X.</p>
        </div>
      </div>
    </div>
  );
};

SectionTestimonials.defaultProps = {
  rootClassName: null,
  className: null,
  currentUserListing: null,
  currentUserListingFetched: false,
};

SectionTestimonials.propTypes = {
  rootClassName: string,
  className: string,
  currentUserListing: propTypes.ownListing,
  currentUserListingFetched: bool,
};

export default SectionTestimonials;
