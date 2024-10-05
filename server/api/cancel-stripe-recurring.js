const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Cancels a subscription
module.exports = async (req, res) => {
  const { subscriptionId } = req.body;
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    res.status(200).json(subscription);
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: error.message });
  }
};
