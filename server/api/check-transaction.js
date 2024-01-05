const { getIntegrationSdk, getSdk, serialize } = require('../api-util/sdk');

module.exports = async (req, res) => {
  try {
    const { listingId } = req.body;
    const sdk = await getSdk(req, res);
    const currentUser = await sdk.currentUser.show();
    const currentUserId = currentUser?.data?.data?.id?.uuid;
    console.log('listingId', listingId?.uuid);
    console.log('currentUserId', currentUserId);
    if (!currentUserId)
      return res.status(422).json({
        message: 'User not logged in',
      });
    const listing = await sdk.listings.show({
      id: listingId,
      include: ['author'],
    });
    const author = listing?.data?.included;
    const providerId = author[0]?.id?.uuid;

    const integrationSdk = await getIntegrationSdk();
    const transactionReponse = await integrationSdk.transactions.query({
      listingId: listingId?.uuid,
      customerId: currentUserId,
      providerId: providerId,
    });

    const { status, statusText, data } = transactionReponse;
    return res
      .status(status)
      .set('Content-Type', 'application/transit+json')
      .send(
        serialize({
          status,
          statusText,
          data,
        })
      )
      .end();
  } catch (err) {
    console.log('Error in check-transaction.js', err);
    return res.status(422).json({
      message: 'Something went wrong please try again',
    });
  }
};
