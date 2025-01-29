const { transactionLineItems } = require('../api-util/lineItems');
const { getSdk, getTrustedSdk, handleError, serialize } = require('../api-util/sdk');
const moment = require('moment');
module.exports = (req, res) => {
  const { isSpeculative, quantityMaybe, bodyParams, queryParams } = req.body;

  const listingId = bodyParams && bodyParams.params ? bodyParams.params.listingId : null;

  const sdk = getSdk(req, res);
  let lineItems = null;
  let l = null;
  const customerTimezone = bodyParams?.params?.customerTimezone;
  // console.log('customerTimezone', customerTimezone);
  sdk.listings
    .show({ id: listingId })
    .then(listingResponse => {
      const listing = listingResponse.data.data;
      l = listing;
      lineItems = transactionLineItems(listing, { ...bodyParams.params });

      return getTrustedSdk(req);
    })
    .then(trustedSdk => {
      const { params } = bodyParams;
      console.log('params', params);
      console.log(bodyParams, 'bodyParams');
      const nextClass = bodyParams?.params?.nextClass;
      const dateFormat = 'dddd, MMMM Do YYYY, h:mm a z';
      console.log('nextClass', nextClass);
      const providerTimezone = l.attributes.publicData.timezone;
      const time = nextClass || l.attributes.publicData?.startDateString;
      const inputDate = moment.tz(time, dateFormat, customerTimezone);
      const inputDateProvider = moment.tz(time, dateFormat, providerTimezone);
      const customerTime = inputDate
        .clone()
        .tz(customerTimezone)
        .format('dddd, MMMM Do YYYY, h:mm a');
      const providerTime = inputDateProvider
        .clone()
        .tz(customerTimezone)
        .format('dddd, MMMM Do YYYY, h:mm a');
      // const customerTime = moment(time)
      //   .tz(customerTimezone)
      //   .format('DD/MM/yyyy HH:mm');
      // const providerTime = moment(time)
      //   .tz(providerTimezone)
      //   .format('DD/MM/yyyy HH:mm');
      // console.log({
      //   customerTime,
      //   providerTime,
      //   time,
      //   customerTimezone,
      //   providerTimezone,
      // });
      // Add lineItems to the body params
      const body = {
        ...bodyParams,
        params: {
          ...params,
          lineItems,
          metadata: {
            customerTime,
            providerTime,
            customerTimezone,
            providerTimezone,
          },
        },
      };

      if (isSpeculative) {
        return trustedSdk.transactions.initiateSpeculative(body, queryParams);
      }
      return trustedSdk.transactions.initiate(body, queryParams);
    })
    .then(apiResponse => {
      const { status, statusText, data } = apiResponse;
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
    })
    .catch(e => {
      handleError(res, e);
    });
};
