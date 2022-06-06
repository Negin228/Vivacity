const { getTrustedSdk, serialize, handleError, getIntegrationSdk } = require('../api-util/sdk');

module.exports = async (req, res) => {
  if (!req.body?.id) {
    return res.status(422).send({ message: 'Transaction id missing.' });
  }

  const id = req.body.id;

  try {
    const trustedSdk = await getTrustedSdk(req);
    // const integrationSdk = getIntegrationSdk();

    // const transactionResponse = await integrationSdk.transactions.show({
    //   id,
    //   include: ['listing'],
    // });
    // const [listing] = transactionResponse.data.included;
    // const { join_url, start_url } = listing?.attributes?.privateData?.zoom ?? {};

    const apiResponse = await trustedSdk.transactions.transition({
      id,
      transition: 'transition/confirm-payment',
      params: {
        // metadata: {
        //   join_url,
        //   start_url,
        // },
      },
    });

    const { status, statusText, data } = apiResponse;
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
  } catch (e) {
    return handleError(res, e);
  }
};
