const { getIntegrationSdk } = require('../api-util/sdk');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');
const clientId = process.env.SHARETRIBE_INTEGRATION_CLIENT_ID;
const clientSecret = process.env.SHARETRIBE_INTEGRATION_CLIENT_SECRET;
const integrationSdk = flexIntegrationSdk.createInstance({
  clientId,
  clientSecret,
});
// Cancels a subscription
module.exports = async (req, res) => {
  const { subscriptionId, userId, isFreeBooking, transactionId } = req.body;
  console.log('isFreeBooking', isFreeBooking);
  console.log('subscriptionId', subscriptionId);
  console.log('transactionId', transactionId);
  console.log(userId, 'userId');
  const integration = await getIntegrationSdk();
  const userWithStripeAccount = await integration.users.show({
    id: userId,
    include: ['stripeAccount'],
  });
  console.log(userWithStripeAccount, 'userWithStripeAccount');
  if (isFreeBooking) {
    try {
      // Handle transition for free subscription
      console.log(integrationSdk, 'integrationSdk>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
      await integrationSdk.transactions.transition(
        {
          id: transactionId,
          transition: 'transition/cancel',
          params: {
            metadata: {
              subscriptionId: null,
              oldSubscriptionId: transactionId,
              membership: false,
            },
          },
        },
        { expand: true }
      );
      console.log('Great Success');
      return res.status(200).json({ success: true });
    } catch (error) {
      console.log(error, 'error');
      console.error('Error canceling free subscription:', error.data.errors);
      return res.status(500).json({ error: error });
    }
  }
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
