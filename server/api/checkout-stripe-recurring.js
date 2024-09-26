const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getSdk, getIntegrationSdk, getTrustedSdk } = require('../api-util/sdk');
const { transactionLineItems } = require('../api-util/lineItems');
module.exports = async (req, res) => {
  const { userId, priceId, listingId } = req.body;

  console.log(
    '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> CHECKOUT STRIPE RECURRING START >>>>>>>>>>>>>>>>>>>>>>>>'
  );
  const sdk = await getSdk(req, res);
  let lineItems = null;
  let l = null;
  // console.log('customerTimezone', customerTimezone);
  sdk.listings.show({ id: listingId }).then(listingResponse => {
    const listing = listingResponse.data.data;
    bodyParams = {
      bookingType: 'paid',
      hasStockReservationQuantity: listing.attributes.publicData.stock,
      hasQuantity: listing.attributes.publicData.stock,
      bookingStart: listing.attributes.publicData.startDate,
      bookingEnd: listing.attributes.publicData.endDate,
      orderQuantity: 1,
      params: {
        listingId: listingId,
        stockReservationQuantity: 1,
      },
    };
    l = listing;
    lineItems = transactionLineItems(listing, { ...bodyParams.params });
    console.log(listing, 'listing');
    console.log(lineItems, 'lineItems');
    return lineItems;
  });

  const integration = await getIntegrationSdk();
  const userWithStripeAccount = await integration.users.show({
    id: userId,
    include: ['stripeAccount'],
  });
  const stripeAccount = userWithStripeAccount?.data?.included[0]?.attributes?.stripeAccountId;

  const trustedSdk = await getTrustedSdk(req);
  // Initiate the transaction
  const transactionResponse = await trustedSdk.transactions.initiate(
    {
      processAlias: 'flex-hourly-default-process/release-1',
      transition: 'transition/request-payment',
      params: {
        listingId: listingId,
        stockReservationQuantity: 1,
        lineItems: lineItems,
      },
    },
    {
      expand: true,
    }
  );

  // Log the transaction response
  console.log('Transaction initiated:', transactionResponse.data);
  // try {
  //   const session = await stripe.checkout.sessions.create(
  //     {
  //       mode: 'subscription',
  //       line_items: [
  //         {
  //           price: priceId,
  //           quantity: 1,
  //         },
  //       ],
  //       success_url: `${process.env.REACT_APP_CANONICAL_ROOT_URL}?session_id={CHECKOUT_SESSION_ID}`,
  //       cancel_url: `${process.env.REACT_APP_CANONICAL_ROOT_URL}/checkout`,
  //     },
  //     {
  //       stripeAccount: stripeAccount,
  //     }
  //   );
  //   console.log(session, 'response session');
  //   console.log(
  //     '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>CHECKOUT SESSION CREATED>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'
  //   );
  //   return res.status(200).json({ url: session.url });
  // } catch (error) {
  //   console.log(
  //     '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> CHECKOUT STRIPE RECURRING ERROR >>>>>>>>>>>>>>>>>>>>>>>>',
  //     error
  //   );
  //   res.status(400).send(error);
  // }
};
