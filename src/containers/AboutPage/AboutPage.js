import React from 'react';
import config from '../../config';
import { twitterPageURL } from '../../util/urlHelpers';
import { StaticPage, TopbarContainer } from '../../containers';
import {
  LayoutSingleColumn,
  LayoutWrapperTopbar,
  LayoutWrapperMain,
  LayoutWrapperFooter,
  Footer,
  NamedLink,
  ExternalLink,
} from '../../components';

import css from './AboutPage.module.css';
import image from './about-us-1056.jpg';

const AboutPage = () => {
  const { siteTwitterHandle, siteFacebookPage } = config;
  const siteTwitterPage = twitterPageURL(siteTwitterHandle);

  // prettier-ignore
  return (
    <StaticPage
      title="About Us"
      schema={{
        '@context': 'http://schema.org',
        '@type': 'AboutPage',
        description: 'About Yogatime',
        name: 'About page',
      }}
    >
      <LayoutSingleColumn>
        <LayoutWrapperTopbar>
          <TopbarContainer />
        </LayoutWrapperTopbar>

        <LayoutWrapperMain className={css.staticPageWrapper}>
          {/* <h1 className={css.pageTitle}>Fitness is our passion!</h1> */}
          {/* <img className={css.coverImage} src={image} alt="My first ice cream." /> */}

          <div className={css.contentWrapper}>
            {/* <div className={css.contentSide}>
              <p>Yoga was listed by UNESCO as an intangible cultural heritage.</p>
            </div> */}

            <div className={css.contentMain}>
              <h2>
              Fitness is our passion!
              </h2>

              <p>
              The idea of Vivacity came to our minds during the COVID 19 pandemic when we were trapped at home with no access to our gym. 
              </p>

              {/* <h3 className={css.subtitle}>Are you a yoga teacher?</h3> */}

              <p>
              We missed working out with friends and started attending some classes online with the instructors we knew. However, it was not as easy as it sounds. The number of online classes were very limited and those that were available did not match our schedule. Besides, the classes we were attending were not interactive and it was just a one-way communication that we did not enjoy.
              </p>

              {/* <h3 id="contact" className={css.subtitle}>
                Create your own marketplace like Yogatime
              </h3> */}
              <p>
              We created Vivacity to be able to attend high-quality virtual classes with our friends no matter where in the world they are and then decided to expand it so that more people experience the joy of interactive group classes with top-notch instructors. We are glad that you found us, and that you have decided to be part of this journey. 
              </p>
              <p>
              Our promise to you is to do our best to elevate your experience in this platform and we would always love to hear from you on how we can make things better.
              </p>
              <p>
              <NamedLink name="ContactPage">Write to us</NamedLink> and let us know. Let's get in touch!
              </p>
              {/* <p>
                You can also checkout our{' '}
                <ExternalLink href={siteFacebookPage}>Facebook</ExternalLink> and{' '}
                <ExternalLink href={siteTwitterPage}>Twitter</ExternalLink>.
              </p> */}
            </div>
          </div>
        </LayoutWrapperMain>

        <LayoutWrapperFooter>
          <Footer />
        </LayoutWrapperFooter>
      </LayoutSingleColumn>
    </StaticPage>
  );
};

export default AboutPage;
