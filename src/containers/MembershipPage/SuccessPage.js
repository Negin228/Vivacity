import React, { useState } from 'react';
import { StaticPage, TopbarContainer } from '..';
import {
  Footer,
  Form,
  IconCheckmark,
  LayoutSingleColumn,
  LayoutWrapperFooter,
  LayoutWrapperMain,
  LayoutWrapperTopbar,
  NamedRedirect,
} from '../../components';
import { BsFillPatchCheckFill } from 'react-icons/bs';
import { useHistory, useParams, withRouter, useRouteMatch } from 'react-router-dom';

function SuccessPage(props) {
  const { location } = props;

  // const success = location?.params?.success;
  // if (!success) return <NamedRedirect name="LandingPage" />;

  return (
    <StaticPage
      title="Success"
      schema={{
        '@context': 'http://schema.org',
        '@type': 'SuccessPage',
        description: 'Success Vivacity',
        name: 'Success page',
      }}
    >
      <LayoutSingleColumn>
        <LayoutWrapperTopbar>
          <TopbarContainer />
        </LayoutWrapperTopbar>

        <LayoutWrapperMain>
          <div>
            <div className="bg-white h-full max-w-3xl sm:my-6 mx-auto sm:shadow sm:rounded-lg">
              <div className="flex flex-col items-center p-24 text-center">
                <BsFillPatchCheckFill className="w-24 h-24 text-green-400" />
                <h5 className="m-0 mt-8 text-xl text-gray-600 font-extrabold">
                  Thank you for subscribing!
                </h5>
                <p className="m-0 text-gray-500 text-md font-semibold">
                  We appreciate you taking the time to join us!
                </p>
                <p className="m-0 text-gray-500 text-md font-semibold">
                  See you in one of our classes soon!
                </p>
              </div>
            </div>
          </div>
        </LayoutWrapperMain>

        <LayoutWrapperFooter>
          <Footer />
        </LayoutWrapperFooter>
      </LayoutSingleColumn>
    </StaticPage>
  );
}

export default withRouter(SuccessPage);
