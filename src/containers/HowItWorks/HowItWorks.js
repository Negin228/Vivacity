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
  ExternalLink,
} from '../../components';

import css from './HowItWorks.module.css';

const HowItWorks = () => {
  const { siteTwitterHandle, siteFacebookPage } = config;
  const siteTwitterPage = twitterPageURL(siteTwitterHandle);

  // prettier-ignore
  return (
    <StaticPage
      title="How It Works"
      schema={{
        '@context': 'http://schema.org',
        '@type': 'HowItWorks',
        description: 'How vivacity works',
        name: 'How It Works',
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
            <p>Thanks for joining Vivacity family! Here is the instruction on how to join Vivacity classes.</p>
              <h2>
              For Students:
              </h2>

              <p>
              It could not get easier than this! Create an account, set your time-zone, choose a class that matches your schedule and interests, click on class to register, proceed with the payment, and you are done! You will receive an email with the link to join the class via Zoom. Make sure that your video is on when you join the class so that the instructor can see you and correct you if necessary. You can unmute yourself if you have questions from the instructors. You can use the same link to go back to the class if you get disconnected.
              </p>

              {/* <h3 className={css.subtitle}>Are you a yoga teacher?</h3> */}
                <h2>
                For Instructors:
                </h2>
              <p>
              Please read our policies carefully before starting to schedule your classes.
              </p>
                <p>
                How to schedule classes: After you create an account, you click on “List a Class” and enter the information about your class. You will list each class separately. You would also need to create a Zoom account to host your classes. We highly suggest you purchase a premium account with Zoom. After you finish setting up your class, it will show up in “My Classes”. Please join the Zoom session 5 to 10 min prior to the start of your classes. It is better to mute everyone once the class starts. Student can unmute themselves to ask questions. Ask the students to pin you in Zoom, to make sure they see you all the time. If you get disconnected during a session, please use the same link to join again. Regardless of the size of each class, please pay attention to all students. And last but not least, have fun!
                </p>
              {/* <h3 id="contact" className={css.subtitle}>
                Create your own marketplace like Yogatime
              </h3> */}
              <p>
                  - <b>Method of Payment</b>: You would need to enter a routing number and an account number to receive payments. You can find this information through your online bank account. If you have a check, the routing number is the nine-digit number printed in the bottom left corner of each check. Your account number (usually 10 to 12 digits) is printed on the bottom of your checks.  
              </p>
              <p>
                  - <b>Payment</b>: Vivacity will make a payment equal to 80% of the proceedings from your training classes to your account. We would use the remaining 20% for promoting our classes and other expenses.
              </p>
              {/* <p>
              <a href="mailto:">Write to us</a> and let us know. Let's get in touch!
              </p> */}
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

export default HowItWorks;
