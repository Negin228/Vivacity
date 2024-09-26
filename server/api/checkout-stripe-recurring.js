const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getSdk, getIntegrationSdk } = require('../api-util/sdk');
const { denormalizeResponseData } = require('./utils');
module.exports = async (req, res) => {
  const { userId, priceId } = req.body;

  console.log(
    '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> CHECKOUT STRIPE RECURRING START >>>>>>>>>>>>>>>>>>>>>>>>'
  );
  const integration = await getIntegrationSdk();
  const userWithStripeAccount = await integration.users.show({
    id: userId,
    include: ['stripeAccount'],
  });
  const stripeAccount = userWithStripeAccount?.data?.included[0]?.attributes?.stripeAccountId;

  try {
    const session = await stripe.checkout.sessions.create(
      {
        mode: 'subscription',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.REACT_APP_CANONICAL_ROOT_URL}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.REACT_APP_CANONICAL_ROOT_URL}/checkout`,
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
    res.status(400).send(error);
  }
};
