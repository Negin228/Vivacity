const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getIntegrationSdk } = require('../api-util/sdk');
module.exports = async (req, res) => {
  console.log(
    '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> CREATE STRIPE PRODUCT AND PRICE START >>>>>>>>>>>>>>>>>>>>>>>>'
  );
  //   const integration = await getIntegrationSdk();
  //   const userWithStripeAccount = await integration.users.show({
  //     id: userId,
  //     include: ['stripeAccount'],
  //   });
  //   const stripeAccount = userWithStripeAccount?.data?.included[0]?.attributes?.stripeAccountId;

  //   console.log(stripeAccount, 'stripeAccount');
  const { listingTitle, listingDescription, amount, listingId, stripeAccount } = req.body;

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
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> PRODUCT CREATED >>>>>>>>>>>>>>>>>>>>>>>>>');

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
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> PRICE CREATED >>>>>>>>>>>>>>>>>>>>>>>>>');
    await getIntegrationSdk.listings.update({
      id: listingId,
      publicData: {
        priceId: price.id,
      },
    });
    res.status(200).json({ product, price });
  } catch (error) {
    console.error('Error creating Stripe product and price:', error);
    res.status(500).json({ error: error.message });
  }
};
