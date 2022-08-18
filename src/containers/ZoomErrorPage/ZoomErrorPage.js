import React from 'react';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { injectIntl } from '../../util/reactIntl';
import { isScrollingDisabled } from '../../ducks/UI.duck';
import config from '../../config';
import {
  Page,
  LayoutSingleColumn,
  LayoutWrapperTopbar,
  LayoutWrapperMain,
  LayoutWrapperFooter,
  Footer,
  NamedLink,
  NamedRedirect,
} from '../../components';
import { TopbarContainer } from '../../containers';
import facebookImage from '../../assets/yogatimeFacebook-1200x630.jpg';
import twitterImage from '../../assets/yogatimeTwitter-600x314.jpg';

export const ZoomErrorPageComponent = props => {
  const { intl, scrollingDisabled, location } = props;

  const searchParams = new URLSearchParams(location.search);

  const error = searchParams.get('error');
  const queryError = error == 'true';

  if (!queryError) return <NamedRedirect name="LandingPage" />;

  const siteTitle = config.siteTitle;
  const schemaTitle = intl.formatMessage({ id: 'ZoomErrorPage.schemaTitle' }, { siteTitle });
  const schemaDescription = intl.formatMessage({ id: 'ZoomErrorPage.schemaDescription' });
  const schemaImage = `${config.canonicalRootURL}${facebookImage}`;
  return (
    <Page
      // className={css.root}
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
          <div
            className="bg-gray-50  my-16 text-center container mx-auto grid place-content-center"
            style={{ minHeight: '50vh' }}
          >
            <div className="max-w-2xl">
              <h1 className="m-0 text-3xl tracking-normal mb-2 text-black">
                Sorry something went wrong
              </h1>
              <p className="m-0 text-base text-black">
                There was an error while creating the ZOOM meeting, please refresh the page and try
                again. If the problem persists, please contact the marketplace administrator. Please{' '}
                <NamedLink name="LandingPage">click here</NamedLink> to go back to the homepage.
              </p>
            </div>
          </div>
        </LayoutWrapperMain>
        <LayoutWrapperFooter>
          <Footer />
        </LayoutWrapperFooter>
      </LayoutSingleColumn>
    </Page>
  );
};

const mapStateToProps = state => {
  return {
    scrollingDisabled: isScrollingDisabled(state),
  };
};

// Note: it is important that the withRouter HOC is **outside** the
// connect HOC, otherwise React Router won't rerender any Route
// components since connect implements a shouldComponentUpdate
// lifecycle hook.
//
// See: https://github.com/ReactTraining/react-router/issues/4671
const ZoomErrorPage = compose(
  withRouter,
  connect(mapStateToProps),
  injectIntl
)(ZoomErrorPageComponent);

export default ZoomErrorPage;
