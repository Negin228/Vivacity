import React from 'react';
import { bool, object } from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { injectIntl, intlShape } from '../../util/reactIntl';
import { isScrollingDisabled } from '../../ducks/UI.duck';
import { propTypes } from '../../util/types';
import config from '../../config';
import moment from 'moment';
import {
  Page,
  SectionHero,
  SectionHowItWorks,
  SectionLocations,
  SectionUpcomingClasses,
  LayoutSingleColumn,
  LayoutWrapperTopbar,
  LayoutWrapperMain,
  LayoutWrapperFooter,
  Footer,
  SectionTrainers,
} from '../../components';
import { TopbarContainer } from '../../containers';
import { getMarketplaceEntities } from '../../ducks/marketplaceData.duck';
import facebookImage from '../../assets/yogatimeFacebook-1200x630.jpg';
import twitterImage from '../../assets/yogatimeTwitter-600x314.jpg';
import css from './LandingPage.module.css';

export const LandingPageComponent = props => {
  const {
    history,
    intl,
    location,
    scrollingDisabled,
    currentUserListing,
    currentUserListingFetched,
    products,
    productsLoading,
    productsError,
    trainers,
    trainersLoading,
    trainersError,
  } = props;

  // Schema for search engines (helps them to understand what this page is about)
  // http://schema.org
  // We are using JSON-LD format
  const siteTitle = config.siteTitle;
  const schemaTitle = intl.formatMessage({ id: 'LandingPage.schemaTitle' }, { siteTitle });
  const schemaDescription = intl.formatMessage({ id: 'LandingPage.schemaDescription' });
  const schemaImage = `${config.canonicalRootURL}${facebookImage}`;
  return (
    <Page
      className={css.root}
      scrollingDisabled={scrollingDisabled}
      contentType="website"
      description={schemaDescription}
      title={schemaTitle}
      facebookImages={[{ url: facebookImage, width: 1200, height: 630 }]}
      twitterImages={[
        { url: `${config.canonicalRootURL}${twitterImage}`, width: 600, height: 314 },
      ]}
      schema={{
        '@context': 'http://schema.org',
        '@type': 'WebPage',
        description: schemaDescription,
        name: schemaTitle,
        image: [schemaImage],
      }}
    >
      <LayoutSingleColumn>
        <LayoutWrapperTopbar>
          <TopbarContainer />
        </LayoutWrapperTopbar>
        <LayoutWrapperMain>
          <div className={css.heroContainer}>
            <SectionHero className={css.hero} history={history} location={location} />
          </div>
          <ul className={css.sections}>
            {/* <li className={css.section}>
              <div className={css.sectionContentFirstChild}>
                <SectionLocations />
              </div>
            </li> */}
            <li className={css.section}>
              <div className={css.sectionContent}>
                <SectionUpcomingClasses
                  loading={productsLoading}
                  error={productsError}
                  products={products}
                />
              </div>
            </li>
            <li className={css.section}>
              <div className={css.sectionContent}>
                <SectionTrainers
                  trainers={trainers}
                  loading={trainersLoading}
                  error={trainersError}
                />
              </div>
            </li>
            <li className={css.section}>
              <div className={css.sectionContent}>
                <SectionHowItWorks
                  currentUserListing={currentUserListing}
                  currentUserListingFetched={currentUserListingFetched}
                />
              </div>
            </li>
          </ul>
        </LayoutWrapperMain>
        <LayoutWrapperFooter>
          <Footer />
        </LayoutWrapperFooter>
      </LayoutSingleColumn>
    </Page>
  );
};

LandingPageComponent.defaultProps = {
  currentUserListing: null,
  currentUserListingFetched: false,
};

LandingPageComponent.propTypes = {
  scrollingDisabled: bool.isRequired,
  currentUserListing: propTypes.ownListing,
  currentUserListingFetched: bool,

  // from withRouter
  history: object.isRequired,
  location: object.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  const { currentUserListing, currentUserListingFetched } = state.user;
  const {
    productIds,
    productsLoading,
    productsError,
    trainersLoading,
    trainerData,
    trainersError,
  } = state.LandingPage;
  const productArr = productIds?.map((t, i) => {
    const ref = { id: t, type: 'listing' };
    const listings = getMarketplaceEntities(state, [ref]);
    return listings.length === 1 ? listings[0] : null;
  });
  const products = productArr?.filter(
    l =>
      moment(l.attributes.publicData.startDate)
        .tz(l.attributes.publicData.timezone, true)
        .local()
        .format() > moment().format()
  );
  const trainers = trainerData?.map(trainer => {
    return {
      trainerName: trainer.attributes?.profile?.displayName,
      trainerProfileImage: trainer.profileImage?.attributes?.variants?.default?.url,
    };
  });
  return {
    scrollingDisabled: isScrollingDisabled(state),
    currentUserListing,
    currentUserListingFetched,
    products,
    productsLoading,
    productsError,
    trainers,
    trainersLoading,
    trainersError,
  };
};

// Note: it is important that the withRouter HOC is **outside** the
// connect HOC, otherwise React Router won't rerender any Route
// components since connect implements a shouldComponentUpdate
// lifecycle hook.
//
// See: https://github.com/ReactTraining/react-router/issues/4671
const LandingPage = compose(
  withRouter,
  connect(mapStateToProps),
  injectIntl
)(LandingPageComponent);

export default LandingPage;
