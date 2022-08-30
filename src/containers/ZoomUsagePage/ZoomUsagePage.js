import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from '../../util/reactIntl';
import { isScrollingDisabled } from '../../ducks/UI.duck';
import { TopbarContainer } from '..';
import {
  Page,
  LayoutSideNavigation,
  LayoutWrapperMain,
  LayoutWrapperSideNav,
  LayoutWrapperTopbar,
  LayoutWrapperFooter,
  PrivacyPolicy,
  Footer,
} from '../../components';
import config from '../../config';
import first from '../../assets/zoom/usage/1.png';
import second from '../../assets/zoom/usage/second.png';
import third from '../../assets/zoom/usage/3.png';
// import fourth from '../../assets/zoom/usage/4.png';
import fifth from '../../assets/zoom/usage/fifth.png';

import rFirst from '../../assets/zoom/revoking/1.png';
import rSecond from '../../assets/zoom/revoking/2.png';
import rThird from '../../assets/zoom/revoking/3.png';
import rFourth from '../../assets/zoom/revoking/4.png';
import rFifth from '../../assets/zoom/revoking/5.png';

import css from './ZoomUsagePage.module.css';

const ZoomUsagePageComponent = props => {
  const { scrollingDisabled, intl } = props;

  const tabs = [
    {
      text: 'Privacy Policy',
      selected: false,
      linkProps: {
        name: 'PrivacyPolicyPage',
      },
    },
    {
      text: 'Zoom Usage',
      selected: true,
      linkProps: {
        name: 'ZoomUsagePage',
      },
    },
    {
      text: 'Terms Of Service',
      selected: false,
      linkProps: {
        name: 'TermsOfServicePage',
      },
    },
    // {
    //   text: intl.formatMessage({ id: 'ZoomUsagePage.tosTabTitle' }),
    //   selected: false,
    //   linkProps: {
    //     name: 'TermsOfServicePage',
    //   },
    // },
  ];
  const siteTitle = config.siteTitle;
  const schemaTitle = intl.formatMessage({ id: 'ZoomUsagePage.schemaTitle' }, { siteTitle });
  const schema = {
    '@context': 'http://schema.org',
    '@type': 'WebPage',
    name: schemaTitle,
  };
  return (
    <Page title={schemaTitle} scrollingDisabled={scrollingDisabled} schema={schema}>
      <LayoutSideNavigation>
        <LayoutWrapperTopbar>
          <TopbarContainer currentPage="ZoomUsagePage" />
        </LayoutWrapperTopbar>
        <LayoutWrapperSideNav tabs={tabs} />
        <LayoutWrapperMain>
          <div className={css.content}>
            <h1 className={css.heading}>Zoom Usage</h1>
            <section>
              <h2 className={css.sectionTitle}>Adding &amp; Usage:</h2>
              <ol type="1" className={css.usageList}>
                <li>
                  Click on <strong>+Add a class</strong> link.
                </li>
                <li>
                  <figure className={css.figure}>
                    <img className={css.image} src={first} />
                    <figcaption>Fill in the description tab with the details.</figcaption>
                  </figure>
                </li>
                <li>
                  Click on <strong>Next: Zoom &amp; Photos</strong> Button to continue to the next
                  tab.
                </li>
                <li>
                  <figure className={css.figure}>
                    <img className={css.image} src={second} />
                    <figcaption>Click on Continue with Zoom login link.</figcaption>
                  </figure>
                </li>
                {/* <li>
                  <figure className={css.figure}>
                    <img className={css.image} src={third} />

                    <figcaption>
                      Check the option <em>Allow this app to use my shared access permissions.</em>
                    </figcaption>
                  </figure>
                </li> */}
                <li>
                  <figure className={css.figure}>
                    <img className={css.image} src={third} />
                    <figcaption>
                      Click on <strong>Allow</strong> button
                    </figcaption>
                  </figure>
                </li>
                <li>
                  <figure className={css.figure}>
                    <img className={css.image} src={fifth} />
                    <figcaption>
                      You will be redirected to the listing wizard. The wizard will showcase join
                      and start urls of the meeting that was created.
                      {/* , Add <strong>Photos</strong> */}
                      {/* and click on publish class profile button. */}
                    </figcaption>
                  </figure>
                </li>
                {/* <li>Add your bank account details.</li> */}
              </ol>
            </section>
            <hr />

            <section>
              <h2 className={css.sectionTitle}>Revoking app access:</h2>
              <ol type="1" className={css.revokeList}>
                <li>
                  <figure className={css.figure}>
                    <img className={css.image} src={rFirst} />
                    <figcaption>
                      In Admin section, click on <strong>Advanced</strong> . Click on{' '}
                      <strong>App Marketplace</strong>.
                    </figcaption>
                  </figure>
                </li>
                <li>
                  <figure className={css.figure}>
                    <img className={css.image} src={rSecond} />
                    <figcaption>
                      Click on <strong>Manage</strong>
                    </figcaption>
                  </figure>
                </li>
                <li>
                  <figure className={css.figure}>
                    <img className={css.image} src={rThird} />
                    <figcaption>
                      In <em>Personal App Management</em>. Click on <strong>Added Apps</strong>
                    </figcaption>
                  </figure>
                </li>
                <li>
                  <figure className={css.figure}>
                    <img className={css.image} src={rFourth} />
                    <figcaption>
                      You will see a list of all apps that you have authorized to access your Zoom
                      Information/Account. There will be a remove button next to each app on right
                      side.
                    </figcaption>
                  </figure>
                </li>
                <li>
                  <figure className={css.figure}>
                    <img className={css.image} src={rFifth} />
                    <figcaption>
                      Click on <strong>Remove</strong>. Confirm your choice by clicking on remove
                      button in the popup.
                    </figcaption>
                  </figure>
                </li>
              </ol>
            </section>
          </div>
        </LayoutWrapperMain>
        <LayoutWrapperFooter>
          <Footer />
        </LayoutWrapperFooter>
      </LayoutSideNavigation>
    </Page>
  );
};

const { bool } = PropTypes;

ZoomUsagePageComponent.propTypes = {
  scrollingDisabled: bool.isRequired,

  // from injectIntl
  intl: intlShape.isRequired,
};

const mapStateToProps = state => {
  return {
    scrollingDisabled: isScrollingDisabled(state),
  };
};

const ZoomUsagePage = compose(
  connect(mapStateToProps),
  injectIntl
)(ZoomUsagePageComponent);

export default ZoomUsagePage;
