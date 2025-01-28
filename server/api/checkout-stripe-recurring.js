const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const {
  getSdk,
  getIntegrationSdk,
  getTrustedSdk,
  handleError,
  serialize,
} = require('../api-util/sdk');
const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');
const clientId = process.env.SHARETRIBE_INTEGRATION_CLIENT_ID;
const clientSecret = process.env.SHARETRIBE_INTEGRATION_CLIENT_SECRET;
const integrationSdk = flexIntegrationSdk.createInstance({
  clientId,
  clientSecret,
});

const { transactionLineItems } = require('../api-util/lineItems');
const moment = require('moment');
const rootUrl =
  process.env.REACT_APP_CANONICAL_ROOT_URL == 'http://localhost:3000'
    ? 'http://localhost:3500'
    : process.env.REACT_APP_CANONICAL_ROOT_URL;
module.exports = async (req, res) => {
  try {
    const { userId, priceId, listingId, customerTimezone, userEmail, isFreeBooking } = req.body;
    console.log(userEmail, 'userEmail');
    console.log(
      '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> CHECKOUT STRIPE RECURRING START >>>>>>>>>>>>>>>>>>>>>>>>'
    );

    const sdk = await getSdk(req, res);
    let lineItems = null;
    let l = null;
    let bodyParams = {};

    const listingResponse = await sdk.listings.show({ id: listingId });
    const listing = listingResponse.data.data;
    bodyParams = {
      processAlias: 'flex-subscription/release-4',
      transition: 'transition/request-payment',
      params: {
        bookingType: isFreeBooking ? 'free' : 'paid',
        hasStockReservationQuantity: listing.attributes.publicData.stock,
        hasQuantity: listing.attributes.publicData.stock,
        bookingStart: listing.attributes.publicData.startDate,
        bookingEnd: listing.attributes.publicData.endDate,
        orderQuantity: 1,
        listingId: listingId,
        stockReservationQuantity: 1,
      },
    };
    l = listing;
    lineItems = transactionLineItems(listing, { ...bodyParams.params });
    console.log(bodyParams, lineItems, 'hello');

    const trustedSdk = await getTrustedSdk(req);
    const { params } = bodyParams;
    const providerTimezone = l.attributes.publicData.timezone;
    const time = l.attributes.publicData?.startDateString;
    const inputDate = moment.tz(time, customerTimezone);
    const inputDateProvider = moment.tz(time, providerTimezone);
    const customerTime = inputDate
      .clone()
      .tz(customerTimezone)
      .format('dddd, MMMM Do YYYY, h:mm a');
    const providerTime = inputDateProvider
      .clone()
      .tz(customerTimezone)
      .format('dddd, MMMM Do YYYY, h:mm a');

    // Add lineItems to the body params
    const body = {
      ...bodyParams,
      params: {
        ...params,
        lineItems,
        metadata: {
          customerTime,
          providerTime,
          customerTimezone,
          providerTimezone,
        },
      },
    };
    const queryParams = { include: ['booking', 'provider'], expand: true };

    const apiResponse = await trustedSdk.transactions.initiate(body, queryParams);

    console.log('API Response:', apiResponse);
    const { status, statusText, data } = apiResponse;
    const transactionId = apiResponse.data.data.id.uuid;
    console.log(transactionId, 'transactionId');
    console.log(data, 'apiResponse');
    if (isFreeBooking) {
      console.log(
        '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> CHECKOUT STRIPE RECURRING FREE BOOKING >>>>>>>>>>>>>>>>>>>>>>>>',
        isFreeBooking
      );

      // Complete transition for free subscription
      await integrationSdk.transactions.transition({
        id: transactionId,
        transition: 'transition/confirm-subscription',
        params: {
          metadata: {
            subscriptionId: transactionId, // Use transactionId as subscriptionId
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
            plan: 'monthly',
            priceId: null,
            membership: true,
            isFree: true,
          },
        },
      });

      return res.status(200).json({
        url: `${rootUrl}/membership/success`,
      });
    }
    // res
    //   .status(status)
    //   .set('Content-Type', 'application/transit+json')
    //   .send(
    //     serialize({
    //       status,
    //       statusText,
    //       data,
    //     })
    //   )
    //   .end();

    const integration = await getIntegrationSdk();
    const userWithStripeAccount = await integration.users.show({
      id: userId,
      include: ['stripeAccount'],
    });
    const stripeAccount = userWithStripeAccount?.data?.included[0]?.attributes?.stripeAccountId;

    const session = await stripe.checkout.sessions.create(
      {
        mode: 'subscription',
        customer_email: userEmail,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        subscription_data: {
          metadata: {
            transactionId: transactionId,
            userId: userId,
            plan: 'monthly',
            priceId: priceId,
          },
        },
        success_url: `${rootUrl}/api/stripe/success?userId=${userId}`,
        cancel_url: `${rootUrl}/api/stripe/cancel`,
      },
      {
        stripeAccount: stripeAccount,
      }
    );
    console.log(session, 'response session');
    console.log(
      '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>CHECKOUT SESSION CREATED>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'
    );
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.log(
      '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> CHECKOUT STRIPE RECURRING ERROR >>>>>>>>>>>>>>>>>>>>>>>>',
      error
    );

    res.status(400).json({ error: error.message });
  }
};
