const {
  getSdk,
  serialize,
  handleError,
  getIntegrationSdk,
  getTrustedSdk,
} = require('../api-util/sdk');
const moment = require('moment');
module.exports = async (req, res) => {
  try {
    const { id, userTimeZone } = req.body;
    console.log('id--------------->', id?.uuid);
    if (!id)
      return res.status(400).json({
        message: 'Transaction id is required',
      });
    if (!userTimeZone) {
      return res.status(400).json({
        message: 'userTimeZone is required',
      });
    }
    const sdk = await getSdk(req, res);
    const trustedSdk = await getTrustedSdk(req, res);
    const integrationSdk = await getIntegrationSdk(req, res);
    const transactionData = await integrationSdk.transactions.show({
      id: id?.uuid,
      include: ['listing'],
    });
    const listing = transactionData?.data?.included[0];
    const { attributes } = listing || {};
    const { publicData } = attributes || {};
    const { startDate: lStartDate } = publicData || {};
    const transactionMetadata = transactionData?.data?.data?.attributes?.metadata || {};
    const { providerTime } = transactionMetadata;
    //startDate with userTimeZone
    const startDate = moment.tz(providerTime || lStartDate, userTimeZone);
    const currentDate = moment.tz(new Date(), userTimeZone);
    console.log('dates--------------->', {
      currentDate: currentDate.format('YYYY-MM-DD HH:mm a'),
      startDate: startDate.format('YYYY-MM-DD HH:mm a'),
    });
    if (startDate.isBefore(currentDate)) {
      console.log('start date is in past');
      return res.status(400).json({
        message: 'Transaction cannot be accepted because class start date is in past. ',
      });
    }
    const response = await trustedSdk.transactions.transition(
      { id, transition: 'transition/accept', params: {} },
      { expand: true }
    );
    const { status, statusText, data } = response;
    res
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
    handleError(res, e);
  }
};
