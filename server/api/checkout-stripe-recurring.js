const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  console.log(
    '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> CHECKOUT STRIPE RECURRING START >>>>>>>>>>>>>>>>>>>>>>>>'
  );
  const { listingTitle, price, listingDescription } = req.body;
  const { amount, currency } = price;

  try {
    // Step 1: Create a Product
    const product = await stripe.products.create({
      name: listingTitle,
      description: listingDescription,
    });
    console.log(product);
    console.log(
      '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>PRODUCT CREATED>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>'
    );
    // Step 2: Create a Price associated with the Product
    const price = await stripe.prices.create({
      currency: 'usd',
      unit_amount: amount,
      recurring: {
        interval: 'month',
      },
      product: product.id,
    });

    console.log(price, 'response price');
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>PRICE CREATED>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');

    // Step 3: Create a Checkout Session using the Price ID
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: price.id,
          quantity: 1,
        },
      ],
      success_url: `${process.env.SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.CANCEL_URL,
    });
  } catch (error) {
    console.log(
      '>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> CHECKOUT STRIPE RECURRING ERROR >>>>>>>>>>>>>>>>>>>>>>>>',
      error
    );
    res.status(400).send(error);
  }
};
