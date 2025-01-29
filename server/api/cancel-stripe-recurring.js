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
const handleTransition = async (transactionId, subscriptionId = null) => {
  // Get transaction details
  const transaction = await integrationSdk.transactions.show({ id: transactionId });
  const lastTransition = transaction.data.data.attributes.lastTransition;

  // Define transition based on last state
  let transitionName;
  switch (lastTransition) {
    case 'transition/confirm-subscription':
      transitionName = 'transition/cancel';
      break;
    case 'transition/complete':
      transitionName = 'transition/cancel-after-delivery';
      break;
    case 'transition/review-1-by-customer':
    case 'transition/expire-review-period':
      transitionName = 'transition/cancel-after-review';
      break;
    default:
      transitionName = 'transition/cancel';
  }

  // Perform transition
  return await integrationSdk.transactions.transition(
    {
      id: transactionId,
      transition: transitionName,
      params: {
        metadata: {
          subscriptionId: null,
          oldSubscriptionId: subscriptionId || transactionId,
          membership: false,
        },
      },
    },
    { expand: true }
  );
};
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
  try {
    if (!isFreeBooking) {
      console.log('Is not free booking');
      const userWithStripeAccount = await integration.users.show({
        id: userId,
        include: ['stripeAccount'],
      });
      const stripeAccount = userWithStripeAccount?.data?.included[0]?.attributes?.stripeAccountId;

      // Cancel Stripe subscription
      await stripe.subscriptions.cancel(subscriptionId, {
        stripeAccount: stripeAccount,
      });
    }

    // Handle transition for both free and paid bookings
    await handleTransition(transactionId, subscriptionId);
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return res.status(500).json({ error: error.message });
  }
};
