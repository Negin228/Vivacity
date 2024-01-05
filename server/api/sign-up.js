const { serialize, getSdk, getIntegrationSdk } = require('../api-util/sdk');

module.exports = async (req, res) => {
  try {
    const { createUserParams } = req.body;
    const sdk = await getSdk(req, res);
    const integrationSdk = await getIntegrationSdk();
    const createUser = await sdk.currentUser.create(createUserParams);
    const createUserId = createUser?.data?.data?.id?.uuid;
    // console.log('createUserId', createUserId);
    const updateUser = await integrationSdk.users.updateProfile({
      id: createUserId,
      metadata: {
        featured: true,
      },
    });
    // console.log('updateUser', updateUser);
    const { status, statusText, data } = createUser;
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
