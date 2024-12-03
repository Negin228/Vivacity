import React, { useState, useCallback } from 'react';
import { StaticPage, TopbarContainer } from '..';
import {
  Footer,
  Form,
  LayoutSingleColumn,
  LayoutWrapperFooter,
  LayoutWrapperMain,
  LayoutWrapperTopbar,
  FieldRadioButton,
} from '../../components';
import { Form as FinalForm } from 'react-final-form';
import FieldInput from './FieldInput';
import { composeValidators, emailFormatValid, required } from '../../util/validators';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ContactUs() {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = useCallback(async (formValues) => {
    const { fullName = '', email, message, userType } = formValues;

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await axios.post('/contact-us', {
        name: fullName,
        userType,
        email,
        message,
      });

      const { success } = response.data;

      if (success) {
        navigate('/success', {
          state: { success },
        });
      }
    } catch (e) {
      const error = e.response?.data?.message || 'An unexpected error occurred. Please try again later.';
      setErrorMessage(error);
    } finally {
      setSubmitting(false);
    }
  }, [navigate]);

  return (
    <StaticPage
      title="Contact Us"
      schema={{
        '@context': 'http://schema.org',
        '@type': 'ContactUsPage',
        description: 'Contact Vivacity',
        name: 'Contact page',
      }}
    >
      <LayoutSingleColumn>
        <LayoutWrapperTopbar>
          <TopbarContainer />
        </LayoutWrapperTopbar>

        <LayoutWrapperMain>
          <FinalForm
            onSubmit={handleSubmit}
            render={({ handleSubmit, values, errors }) => {
              const submitDisabled = !(
                values?.userType &&
                values?.message &&
                Object.keys(errors || {}).length === 0
              );

              return (
                <form onSubmit={handleSubmit}>
                  <div className="bg-white">
                    <div className="mx-auto max-w-3xl w-full my-2 sm:my-4 md:my-8 p-8">
                      <h1
                        className="text-3xl m-0 mb-6 font-extrabold tracking-normal sm:text-4xl text-center text-gray-500 uppercase"
                        style={{ color: 'var(--marketplaceColor)' }}
                      >
                        Contact Us
                      </h1>
                      <div className="col-span-2">
                        <p>
                          We are proud of you as a member of the Vivacity family and we’d love to hear from you! We are glad that you have chosen Vivacity to do your workout sessions or to lead your classes. Let us know what we’re doing well and how we can improve your experience at our virtual studio.
                        </p>
                        <p>
                          Your feedback matters. Together, we can level up the world of virtual fitness.
                        </p>
                      </div>
                      <Form>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                          <div className="col-span-2">
                            <FieldInput
                              type="text"
                              name="fullName"
                              id="fullName"
                              label="Name"
                              placeholder="Name (Optional)"
                            />
                          </div>
                          <div className="col-span-2">
                            <FieldRadioButton
                              name="userType"
                              id="customer"
                              value="student"
                              label="I am a student at Vivacity"
                            />
                            <FieldRadioButton
                              name="userType"
                              id="trainer"
                              value="trainer"
                              label="I am a trainer"
                            />
                          </div>
                          <div className="col-span-2">
                            <FieldInput
                              type="email"
                              name="email"
                              id="email"
                              label="Email"
                              placeholder="Email address (Optional)"
                              validate={emailFormatValid}
                            />
                          </div>
                          <div className="col-span-2 group">
                            <FieldInput
                              type="textarea"
                              name="message"
                              id="message"
                              label="Message"
                              placeholder="Type your message here"
                              validate={required('Message is required')}
                            />
                          </div>
                          {errorMessage && (
                            <h3 className="text-red-500 text-lg font-sans font-semibold m-0 mt-2 col-span-2">
                              {errorMessage}
                            </h3>
                          )}
                          <div className="col-span-2">
                            <button
                              type="submit"
                              disabled={submitDisabled || submitting}
                              className="w-full text-white border-none px-8 py-4 rounded-md shadow font-semibold text-lg mt-4 cursor-pointer bg-marketplaceColor hover:bg-marketplaceColorDark transition-all duration-100 disabled:bg-gray-400 disabled:pointer-events-none"
                            >
                              {submitting ? 'Submitting...' : 'Submit'}
                            </button>
                          </div>
                        </div>
                      </Form>
                    </div>
                  </div>
                </form>
              );
            }}
          />
        </LayoutWrapperMain>

        <LayoutWrapperFooter>
          <Footer />
        </LayoutWrapperFooter>
      </LayoutSingleColumn>
    </StaticPage>
  );
}

export default ContactUs;
