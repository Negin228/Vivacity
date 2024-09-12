const fetch = require('cross-fetch');
const { getSdk, getIntegrationSdk } = require('../api-util/sdk');
const { denormalizeResponseData } = require('./utils');
const moment = require('moment-timezone');
const zoomClientId = process.env.REACT_APP_ZOOM_CLIENT_ID;
const zoomClientSecret = process.env.ZOOM_CLIENT_SECRET;

const ROOT_URL = process.env.REACT_APP_CANONICAL_ROOT_URL;
const ERROR_PAGE_URL = `${ROOT_URL}/zoom-error?error=true`;

const ROOT_API_URL = ROOT_URL === 'http://localhost:3000' ? 'http://localhost:3500' : ROOT_URL;

module.exports = async (req, res) => {
  const { code, backurl: backURL } = req.query;
  const paramsMissing = !code || !backURL;
  const sdk = getSdk(req, res);
  const integrationSdk = getIntegrationSdk();

  // console.log({ paramsMissing });

  if (paramsMissing) return res.redirect(ERROR_PAGE_URL);

  const listingId = backURL.split('/')?.[3];

  // console.log({ listingId });

  if (!listingId) return res.redirect(ERROR_PAGE_URL);

  const data = `${zoomClientId}:${zoomClientSecret}`;
  const hash = Buffer.from(data, 'utf8').toString('base64');

  try {
    const resD = await fetch(
      `https://zoom.us/oauth/token?grant_type=authorization_code&code=${code}&redirect_uri=${ROOT_API_URL}/api/auth/callback/zoom?backurl=${backURL}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${hash}`,
        },
      }
    );

    // console.dir({ resD }, { depth: 420 });

    const data = await resD.json();
    if (resD.status >= 400) {
      let e = new Error();
      e = Object.assign(e, data);
      throw e;
    }

    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> AUTHORIZATION START >>>>>>>>>>>>>>>>>>>>>>>>');
    console.dir(data, { depth: 333 });
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> AUTHORIZATION END >>>>>>>>>>>>>>>>>>>>>>>>');

    const { access_token } = data;

    let listingResponse = await sdk.ownListings.show({
      id: listingId,
    });

    listingResponse = denormalizeResponseData(listingResponse);
    const listing = listingResponse.data;
    const { startDate,
       startDateString,
       timezone: listingTimezone,
       classDuration,
       recurrenceType,
       repeatInterval,
       endRecurrence,
       endDate,
       endTimes,
       weeklyDays,
       monthlyDay
      } =
      listing?.attributes?.publicData ?? {};
    // console.log({ timezone, startDate });
    let duration;
    switch (classDuration.key) {
      case '30_min':
        duration = 30;
        break;
      case '60_min':
        duration = 60;
        break;
      case '90_min':
        duration = 90;
        break;
    }

    const resp = await fetch(`https://api.zoom.us/v2/users/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    // console.dir({ resp }, { depth: 420 });

    const respData = await resp.json();
    if (respData.status >= 400) {
      let e = new Error();
      e = Object.assign(e, respData);
      throw e;
    }
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> USER FETCH START >>>>>>>>>>>>>>>>>>>>>>>>');
    console.dir(respData, { depth: 333 });
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> USER FETCH END >>>>>>>>>>>>>>>>>>>>>>>>');

    const zoomUserId = respData?.id;

    const zoomTimezone = respData?.timezone;

    // const dateFormat = moment(new Date(startDate))
    //   .tz(timezone)
    //   .format('YYYY-MM-DD');
    // const timeFormat = moment(new Date(startDate))
    //   .tz(timezone)
    //   .format('HH:mm:ss');

    const start_time = startDate;
    //  moment(startDate)
    //   .tz(zoomTimezone)
    //   .tz(listingTimezone, true)
    //   .tz(zoomTimezone)
    //   .format('YYYY-MM-DDTHH:mm:ss');

    // console.log({ startDate, listingTimezone, zoomTimezone, start_time });
    // console.log('start_time', start_time);
    // return;

    const meetingParams = {
      start_time: moment.tz(startDate, listingTimezone).format('YYYY-MM-DDTHH:mm:ssZ'),
      // start_time,
      timezone: listingTimezone,
      type: recurrenceType?.value !== '0' ? 8 : 2, // Set type to 8 if recurring, otherwise 2
      duration,
      topic: listing.attributes.title.slice(0, 199),
    };
    // Add recurrence settings if they exist
    if (recurrenceType?.value !== '0') {
      meetingParams.recurrence = {
        type: parseInt(recurrenceType.value, 10),
        repeat_interval: parseInt(repeatInterval, 10),
        end_date_time: endRecurrence?.value === 'end_date' ? moment(endDate).format('YYYY-MM-DDTHH:mm:ssZ') : undefined,
        end_times: endRecurrence?.value === 'end_times' ? parseInt(endTimes, 10) : undefined,
        weekly_days: recurrenceType?.value === '2' ? weeklyDays.map(day => day.value).join(',') : undefined,
        monthly_day: recurrenceType?.value === '3' ? parseInt(monthlyDay, 10) : undefined,
      };
      // Remove undefined properties from the recurrence object
      Object.keys(meetingParams.recurrence).forEach(
        key => meetingParams.recurrence[key] === undefined && delete meetingParams.recurrence[key]
      );
    }
    
    console.log('meetingParams', JSON.stringify(meetingParams));
    const meetingRespData = await fetch(`https://api.zoom.us/v2/users/${zoomUserId}/meetings`, {
      method: 'POST',
      body: JSON.stringify(meetingParams),

      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${access_token}`,
      },
    });

    // console.dir({ meetingRespData }, { depth: 420 });

    const meetingData = await meetingRespData.json();

    if (meetingData.status >= 400) {
      let e = new Error();
      e = Object.assign(e, meetingData);
      throw e;
    }
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> MEETING CREATE START >>>>>>>>>>>>>>>>>>>>>>>>');
    console.dir(meetingData, { depth: 333 });
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> MEETING CREATE END >>>>>>>>>>>>>>>>>>>>>>>>');

    const { start_url, join_url } = meetingData;

    if (start_url && join_url) {
      await integrationSdk.listings.update({
        id: listingId,
        privateData: {
          zoom: {
            start_url,
            join_url,
          },
        },
        publicData: {
          timeUpdated: false,
        },
      });
    }

    if (backURL) return res.redirect(`${ROOT_URL}${backURL}`);
    return res.redirect(ROOT_URL);
  } catch (err) {
    console.dir({ err }, { depth: 420 });
    return res.redirect(ERROR_PAGE_URL);
  }
};
