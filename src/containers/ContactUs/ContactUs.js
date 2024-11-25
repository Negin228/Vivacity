import React, { useState } from 'react';
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
import { useHistory } from 'react-router-dom';
function ContactUs() {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const history = useHistory();

  const handleSubmit = async formValues => {
    const { fullName, email, message, userType } = formValues;
    const name = fullName || '';
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await axios.post('/contact', {
        name,
        userType,
        email,
        message,
      });

      console.log('API Response:', response.data);
      
      const { success } = response.data;

      if (success)
        history.push({
          pathname: '/success',
          params: {
            success,
          },
        });
    } catch (e) {
      console.log('API Error:', e);
      const error = e.response?.data?.message || e.message;
      setErrorMessage(error);
    } finally {
      setSubmitting(false);
    }
  };
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
            submitInProgress={submitting}
            errorMessage={errorMessage}
            render={fieldRenderProps => {
              const {
                values,
                errors,
                handleSubmit,
                submitInProgress,
                errorMessage,
              } = fieldRenderProps;

              const submitDisabled = !(
                values?.userType &&
                values?.message &&
                Object.keys(errors || {}).length == 0
              );
              return (
                <>
                  <div className="bg-white">
                    <div className="mx-auto max-w-3xl w-full my-2 sm:my-4 md:my-8 p-8">
                      <h1
                        className="text-3xl m-0 mb-6 font-extrabold tracking-normal sm:text-4xl text-center text-gray-500 uppercase "
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
                      <Form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                          <div className="col-span-2">
                            <FieldInput
                              type="text"
                              name="fullName"
                              id="fullName"
                              label="Name"
                              placeholder="Name (Optional)"
                              //   validate={required('This field is required')}
                            />
                          </div>
                          <div className="col-span-2">
                            <FieldRadioButton
                              name="userType"
                              id="customer"
                              value={'student'}
                              label="I am a student at Vivacity"
                            />
                            <FieldRadioButton
                              name="userType"
                              id="trainer"
                              value={'trainer'}
                              label="I am a trainer"
                            />
                          </div>
                          {/* <div>
                            <FieldInput
                              type="text"
                              name="lastName"
                              id="lastName"
                              label="Last Name"
                              placeholder="Last Name"
                              validate={required('This field is required')}
                            />
                          </div> */}
                          <div className="col-span-2">
                            <FieldInput
                              type="email"
                              name="email"
                              id="email"
                              label="Email"
                              placeholder="Email address (Optional)"
                            />
                          </div>
                          {/* <div className="col-span-2">
                            <FieldInput
                              type="text"
                              name="subject"
                              id="subject"
                              label="Subject"
                              placeholder="Subject"
                              validate={required('This field is required')}
                            />
                          </div> */}
                          <div className="col-span-2 group">
                            <FieldInput
                              type="textarea"
                              name="message"
                              id="message"
                              label="Message"
                              placeholder="Type your message here"
                              validate={required('This field is required')}
                            />
                          </div>
                          {errorMessage && (
                            <h3 className="text-red-500 text-lg font-sans font-semibold m-0 mt-2 col-span-2">
                              Failed to send the message. Please try again later...
                            </h3>
                          )}
                          <div className="col-span-2">
                            <button
                              disabled={submitDisabled || submitInProgress}
                              className="w-full text-white border-none px-8 py-4 rounded-md shadow font-semibold text-lg mt-4 cursor-pointer bg-marketplaceColor hover:bg-marketplaceColorDark transition-all duration-100 disabled:bg-gray-400 disabled:pointer-events-none"
                            >
                              Submit
                            </button>
                          </div>
                        </div>
                      </Form>
                    </div>
                  </div>
                </>
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
