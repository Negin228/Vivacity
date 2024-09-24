const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { handleError, getSdk, serialize, getIntegrationSdk } = require('../api-util/sdk');

module.exports = async (req, res) => {
  const { listingTitle, price, listingDescription, userId } = req.body;
  const { amount, currency } = price;
  console.log(
    '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> CHECKOUT STRIPE RECURRING START >>>>>>>>>>>>>>>>>>>>>>>>'
  );
  const integration = await getIntegrationSdk();
  const userWithStripeAccount = await integration.users.show({
    id: userId,
    include: ['stripeAccount'],
  });
  const stripeAccount = userWithStripeAccount?.data?.included[0]?.attributes?.stripeAccountId;

  console.log(stripeAccount, 'stripeAccount');

  try {
    // Step 1: Create a Product
    const product = await stripe.products.create(
      {
        name: listingTitle,
        description: listingDescription,
      },
      {
        stripeAccount: stripeAccount,
      }
    );
    console.log(product);
    console.log(
      '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>PRODUCT CREATED>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'
    );
    // Step 2: Create a Price associated with the Product
    const price = await stripe.prices.create(
      {
        currency: 'usd',
        unit_amount: amount,
        recurring: {
          interval: 'month',
        },
        product: product.id,
      },
      {
        stripeAccount: stripeAccount,
      }
    );

    console.log(price, 'response price');
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>PRICE CREATED>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

    // Step 3: Create a Checkout Session using the Price ID
    const session = await stripe.checkout.sessions.create(
      {
        mode: 'subscription',
        line_items: [
          {
            price: price.id,
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
  } catch (error) {
    console.log(
      '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> CHECKOUT STRIPE RECURRING ERROR >>>>>>>>>>>>>>>>>>>>>>>>',
      error
    );
    res.status(400).send(error);
  }
};
