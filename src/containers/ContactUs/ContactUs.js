import React, { useState } from 'react';
import { StaticPage, TopbarContainer } from '..';
import { Footer, Form, LayoutSingleColumn, LayoutWrapperFooter, LayoutWrapperMain, LayoutWrapperTopbar } from '../../components';
import { Form as FinalForm } from 'react-final-form';
import FieldInput from './FieldInput';
import { required, emailFormatValid } from '../../util/validators';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

function ContactUs() {
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const history = useHistory();

  // Handle form submission
  const handleSubmit = async (formValues) => {
    setSubmitting(true);
    setErrorMessage(null); // Reset any previous error messages

    try {
      // Log the form data for debugging purposes
      console.log('Form submitted with:', formValues);

      // Send the data to the server
      const response = await axios.post('/contact', formValues);

      if (response.data.success) {
        history.push('/success'); // Redirect to success page
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      console.error('Error during form submission:', error);
      setErrorMessage('Failed to send the message. Please try again later.');
    } finally {
      setSubmitting(false); // Reset the submitting state
    }
  };

  // Validate the form fields
  const validate = (values) => {
    const errors = {};
    if (!values.fullName) {
      errors.fullName = 'Name is required';
    }
    if (!values.email || !emailFormatValid(values.email)) {
      errors.email = 'A valid email is required';
    }
    if (!values.message) {
      errors.message = 'Message is required';
    }
    if (!values.userType) {
      errors.userType = 'Please select a user type';
    }
    return errors;
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
            validate={validate}
            render={({ handleSubmit, values, errors, touched, submitting }) => {
              // Enable/Disable submit button based on form state
              const submitDisabled = Object.keys(errors).length > 0 || submitting;

              return (
                <>
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

                      <Form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                          <div className="col-span-2">
                            <FieldInput
                              type="text"
                              name="fullName"
                              id="fullName"
                              label="Name"
                              placeholder="Name (Optional)"
                            />
                            {touched.fullName && errors.fullName && (
                              <span className="text-red-500">{errors.fullName}</span>
                            )}
                          </div>

                          <div className="col-span-2">
                            <div>
                              <label>
                                I am a
                                <FieldInput
                                  type="radio"
                                  name="userType"
                                  value="student"
                                  label="Student"
                                />
                                <FieldInput
                                  type="radio"
                                  name="userType"
                                  value="trainer"
                                  label="Trainer"
                                />
                              </label>
                              {touched.userType && errors.userType && (
                                <span className="text-red-500">{errors.userType}</span>
                              )}
                            </div>
                          </div>

                          <div className="col-span-2">
                            <FieldInput
                              type="email"
                              name="email"
                              id="email"
                              label="Email"
                              placeholder="Email address"
                            />
                            {touched.email && errors.email && (
                              <span className="text-red-500">{errors.email}</span>
                            )}
                          </div>

                          <div className="col-span-2 group">
                            <FieldInput
                              type="textarea"
                              name="message"
                              id="message"
                              label="Message"
                              placeholder="Type your message here"
                            />
                            {touched.message && errors.message && (
                              <span className="text-red-500">{errors.message}</span>
                            )}
                          </div>

                          {errorMessage && (
                            <h3 className="text-red-500 text-lg font-sans font-semibold m-0 mt-2 col-span-2">
                              {errorMessage}
                            </h3>
                          )}

                          <div className="col-span-2">
                            <button
                              type="submit"
                              disabled={submitDisabled}
                              className="w-full text-white border-none px-8 py-4 rounded-md shadow font-semibold text-lg mt-4 cursor-pointer bg-marketplaceColor hover:bg-marketplaceColorDark transition-all duration-100 disabled:bg-gray-400 disabled:pointer-events-none"
                            >
                              {submitting ? 'Submitting...' : 'Submit'}
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
