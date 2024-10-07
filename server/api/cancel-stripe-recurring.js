const { getIntegrationSdk } = require('../api-util/sdk');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Cancels a subscription
module.exports = async (req, res) => {
  const { subscriptionId, transactionId, userId } = req.body;
  console.log('subscriptionId', subscriptionId);
  console.log(userId, 'userId');
  const integration = await getIntegrationSdk();
  const userWithStripeAccount = await integration.users.show({
    id: userId,
    include: ['stripeAccount'],
  });
  const stripeAccount = userWithStripeAccount?.data?.included[0]?.attributes?.stripeAccountId;
  console.log(stripeAccount, 'stripeAccount');
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId, {
      stripeAccount: stripeAccount,
    });
    res.status(200).json(subscription);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: error.message });
  }
};
