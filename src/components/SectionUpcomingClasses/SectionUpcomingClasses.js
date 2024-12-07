import React from 'react';
import { bool, string } from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage } from '../../util/reactIntl';
import { propTypes } from '../../util/types';
import { OwnListingLink, ProductCard } from '../../components';
import css from './SectionUpcomingClasses.module.css';
import { injectIntl } from '../../util/reactIntl';
import { IconSpinner } from '../../components';

const SectionUpcomingClasses = ({ loading, error, products, intl }) => {
  if (error) {
    return (
      <div>
        <span className={css.error}>
          Failed to load listings. Please refresh the page to fix the problem.
        </span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={css.loadingContainer}>
        <p>
          <IconSpinner style={{ style: { height: '50px', width: '50px' } }} />
        </p>
      </div>
    );
  }
  let someProducts = products?.slice(0, 5);
  return (
    <div className={classNames(css.productsWrapper, 'bg-white')}>
      {someProducts?.length > 0 ? (
        <h3 className={css.title}>{intl.formatMessage({ id: 'SectionUpcomingClasses.title' })}</h3>
      ) : (
        <>
          <h3 className={css.title}>
            {intl.formatMessage({ id: 'SectionUpcomingClasses.title' })}
          </h3>
          <p>There are no upcoming classes available at the moment.</p>
        </>
      )}
      <div className={css.container}>
        {(someProducts ?? []).map(p => {
          return (
            <ProductCard
              id={p.id.uuid}
              key={p.id.uuid}
              metadata={p?.attributes?.metadata}
              title={p?.attributes?.title}
              teacherName={p?.author?.attributes?.profile?.displayName}
              startDate={p?.attributes?.publicData?.startDate}
              startDateString={p?.attributes?.publicData?.startDateString}
              timeZone={p?.attributes?.publicData?.timezone}
              description={p?.attributes?.description}
              publicData={p?.attributes?.publicData}
              images={p?.images}
              createdAt={p?.attributes?.createdAt}
              intl={intl}
            />
          );
        })}
      </div>
    </div>
  );
};

SectionUpcomingClasses.defaultProps = {
  rootClassName: null,
  className: null,
  currentUserListing: null,
  currentUserListingFetched: false,
};

SectionUpcomingClasses.propTypes = {
  rootClassName: string,
  className: string,
  currentUserListing: propTypes.ownListing,
  currentUserListingFetched: bool,
};

export default injectIntl(SectionUpcomingClasses);
