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
          <div className="bg-white">
          <div className="mx-auto max-w-3xl w-full my-2 sm:my-4 md:my-8 p-8">
          <h1 className="text-3xl m-0 mb-6 font-extrabold tracking-normal sm:text-4xl text-center text-gray-500 uppercase " style={{ color: 'var(--marketplaceColor)' }}>
          ABOUT US
          </h1>
          </div>
          </div>
          <div className={css.contentWrapper}>
            {/* <div className={css.contentSide}>
              <p>Yoga was listed by UNESCO as an intangible cultural heritage.</p>
            </div> */}

            <div className={css.contentMain}>
              <h2>
              Fitness is our passion!
              </h2>

              <p>
              We created Vivacity for us, and for you! We understand how a busy life can get in the way of self-care. Between work, family, and friends, it might be hard to find time in your day to go to the gym or studio to fit in exercise.
              </p>

              {/* <h3 className={css.subtitle}>Are you a yoga teacher?</h3> */}

              <p>
              That’s why we’ve created a platform that merges the convenience of virtual fitness with the community and motivation of live group fitness classes. 
              </p>

              {/* <h3 id="contact" className={css.subtitle}>
                Create your own marketplace like Yogatime
              </h3> */}
              <h2>
              How We Started  
              </h2>
              <p>
              The inspiration for Vivacity virtual fitness emerged during the outbreak of the COVID-19 pandemic. During isolation, we had no access to gyms and fitness facilities. We missed our fitness buddies and gym partners. In the early stages, online fitness was not easy. Class varieties were incredibly limited, making it harder to find classes that fit our schedule and interest. On top of that, we lost the motivating engagement of live feedback from trainers because online fitness classes were not interactive. They were either pre-recorded or one-way streams. It was a lonely experience! 
              </p>
              <p>
              <h2>
              No more doing it alone!
              </h2>
              <p>
                We believe in the power of human connection and in the strength of communities and that’s why we created Vivacity. Our goal was to change the imperfect experience of working out at home alone with a motivating fun one. We want you to bring your friends to our classes and meet new people from around the world. We want you to inspire and get inspired! We want to do this together as we believe together is easier! 
              </p>
              <h2>
              Get in touch!
              </h2>
              <p>
              We want to hear from you on how we can make Vivacity better together. Our commitment to you is that we will always look for ways to improve your Vivacity experience. <NamedLink name="ContactPage">Let's get in touch!</NamedLink>
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
