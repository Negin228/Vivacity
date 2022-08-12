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
              <h1 className="text-3xl m-0 mb-6 font-extrabold tracking-normal sm:text-4xl text-center text-gray-500 uppercase " style={{ color: 'var(--marketplaceColor)' }}>
                How it works
              </h1>

              
              
              <div>
              <p>We welcome you to join the Vivacity team as a student or trainer! Vivacity brings people together to create a supportive community that motivates individuals to do not only more but also better quality workouts! Our goal is to make virtual fitness interactive, convenient, empowering, and – most importantly – fun!</p>
              <p>With Vivacity’s live online fitness classes you get the benefits and insights of a fitness expert without having to go to the gym. We connect you with Vivacity trainers and help you reach your fitness goals on your time from anywhere you are.</p>
              </div>
              <div>
              <h2>
                For Vivacity Students: 
              </h2>
              <h2>
                4 Easy Steps to Personal Fitness
              </h2>
              <ol>
                <li>Create your Vivacity profile and sign up as a student.</li>
                <li>Set your time-zone and browse the Vivacity online fitness class calendar or search for your preferred Vivacity trainer. Then, book a class that suits your schedule and interests.</li>
                <li>Join the session and if possible keep your camera on during the live online fitness class.</li>
                <li>Exercise efficiently as your trainer corrects your movement and form in real time.</li>
              </ol>
              <p>Be sure to leave a review and let your trainers know what they did well and what could be improved.</p>
              </div>
                <br/>
              <div>
              <h2>
                For Vivacity Trainers: 
              </h2>
              <h2>
                4 Easy Steps to Success
              </h2>
              <ol>
                <li>Sign up as a trainer and create your Vivacity profile. Fill in profile details and present who you are as a Vivacity virtual trainer and what you offer to potential clients!</li>
                <li>Create a class. Optimize your class description with keywords and clear reader-friendly language. Set the price, time & date, class duration, and class subject (personal training, HIIT training, Pilates, etc.). To receive payments, you will need to enter your checking account and routing numbers. This information can be provided by your bank or found at the bottom of your personal checks. If you do not have this information, please contact us so we can explore other forms of payment.</li>
                <li>Once you put all the information in, your class will be published on the Vivacity online fitness class calendar for any student to book. Share the link to your class and spread the word! </li>
                <li>Be on time and professional. Deliver what you promise in your class description.</li>
              </ol>
              </div>
              <div>
              <h2>Some Tips to Keep in Mind:</h2>
              <ul>
                <li>&#x2022; Try to join the session 5 to 10 minutes before your class starts.</li>
                <li>&#x2022; Once the class starts, mute everyone so they can hear you clearly, but engage with your students and create a fun, welcoming group fitness environment. Ask students to unmute themselves if they have questions.</li>
                <li>&#x2022; Read reviews to see what’s going well and how you can grow as a Vivacity trainer! </li>
                <li>&#x2022; Ask the students to pin you in Zoom to make sure they see you all the time and can follow your instructions.</li>
                <li>&#x2022; If you get disconnected during a session, please use the same link to join again. Tell your students to do the same in case their connection gets interrupted.</li>
              </ul>
              </div>
              {/* <h3 className={css.subtitle}>Are you a yoga teacher?</h3> */}
                <div>
                <h2>Additional Notes:</h2>
                <ul>
	                <li>&#x2022; Vivacity is excited to connect trainers and trainees and make physical health and wellbeing accessible to more people! In order to maintain the Vivacity platform, we collect 20% of commissions as a hosting fee.</li>
	                <li>&#x2022; As a Vivacity student, it’s up to you to participate in the classes you book. If you miss a class, Vivacity trainers are happy to catch you up and keep you on your path to personal fitness. However, credit for missed classes cannot be given.</li>
                	<li>&#x2022; In the rare event that your Vivacity trainer is unable to attend a class session, all registration fees will be refunded in full.</li>
	                <li>&#x2022; To host as many classes and sessions as you please without interruption, we strongly encourage our trainers to purchase a Zoom Pro account ($14.99/month) so that they can offer flexibility and improved functionality to clients.</li>
                	<li>&#x2022; Have questions? Contact us at contact@vivacity.studio</li>
                 </ul>
                 </div>



              {/* <h3 id="contact" className={css.subtitle}>
                Create your own marketplace like Yogatime
              </h3> */}

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
