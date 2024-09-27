const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const {
  getSdk,
  getIntegrationSdk,
  getTrustedSdk,
  handleError,
  serialize,
} = require('../api-util/sdk');
const { transactionLineItems } = require('../api-util/lineItems');
const moment = require('moment');
const rootUrl =
  process.env.REACT_APP_CANONICAL_ROOT_URL == 'http://localhost:3000'
    ? 'http://localhost:3500'
    : process.env.REACT_APP_CANONICAL_ROOT_URL;
module.exports = async (req, res) => {
  try {
    const { userId, priceId, listingId, customerTimezone } = req.body;

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
      processAlias: 'flex-hourly-default-process/release-1',
      transition: 'transition/request-payment',
      params: {
        bookingType: 'paid',
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
    const { status, statusText, data } = apiResponse;
    const transactionId = data.id;
    console.log(data, 'apiResponse');
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
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        metadata: {
          transactionId: transactionId,
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
