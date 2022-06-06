const { getSdk, getIntegrationSdk } = require('../api-util/sdk');
const { to } = require('./promise-helpers');

module.exports = async (req, res) => {
  const { id } = req.query || {};

  if (!id) {
    return res.status(400).json({
      message: 'Failed to fetch zoom links. Please provide a valid transaction id.',
    });
  }

  const sdk = getSdk(req, res);
  const integrationSdk = getIntegrationSdk();
  const [currentUserResponse, currentUserError] = await to(sdk.currentUser.show());

  const userError = !currentUserResponse?.data?.data || currentUserError;

  if (userError) {
    return res.status(401).json({
      message: 'Failed to fetch zoom links. Unauthorized request.',
    });
  }

  const currentUserId = currentUserResponse.data.data.id.uuid;

  const [transactionResponse, transactionError] = await to(
    integrationSdk.transactions.show({ id, include: ['listing', 'customer', 'provider'] })
  );

  if (transactionError) {
    return res.status(401).json({
      message: 'Failed to fetch zoom links. Unauthorized request.',
    });
  }

  const tx = transactionResponse.data.data;
  const txRelationShips = tx.relationships;
  const included = transactionResponse.data.included;
  const customerId = txRelationShips.customer.data.id.uuid;
  const providerId = txRelationShips.provider.data.id.uuid;

  const userIds = [customerId, providerId];

  if (!userIds.includes(currentUserId)) {
    return res.status(401).json({
      message: 'Failed to fetch zoom links. Unauthorized request.',
    });
  }

  const listing = included.find(i => i.type == 'listing');

  const zoom = listing.attributes.privateData?.zoom;

  if (!zoom) {
    return res.status(400).json({
      message: 'No zoom meeting data found.',
    });
  }

  if (currentUserId == customerId) {
    return res.status(200).json({
      join_url: zoom.join_url,
    });
  }

  if (currentUserId == providerId) {
    return res.status(200).json({
      start_url: zoom.start_url,
    });
  }

  return res.status(400).json({
    message: 'Failed to fetch zoom links. Unauthorized request.',
  });
};
