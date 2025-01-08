const fetch = require('cross-fetch');
const { getSdk, getIntegrationSdk } = require('../api-util/sdk');
const { denormalizeResponseData } = require('./utils');
const moment = require('moment-timezone');

// Constants
const zoomClientId = process.env.REACT_APP_ZOOM_CLIENT_ID;
const zoomClientSecret = process.env.ZOOM_CLIENT_SECRET;
const ROOT_URL = process.env.REACT_APP_CANONICAL_ROOT_URL;
const ERROR_PAGE_URL = `${ROOT_URL}/zoom-error?error=true`;
const ROOT_API_URL = ROOT_URL === 'http://localhost:3000' ? 'http://localhost:3500' : ROOT_URL;

// Helper Functions
const getZoomToken = async (code, backURL) => {
  const data = `${zoomClientId}:${zoomClientSecret}`;
  const hash = Buffer.from(data, 'utf8').toString('base64');

  const response = await fetch(
    `https://zoom.us/oauth/token?grant_type=authorization_code&code=${code}&redirect_uri=${ROOT_API_URL}/api/auth/callback/zoom?backurl=${backURL}`,
    {
      method: 'POST',
      headers: { Authorization: `Basic ${hash}` },
    }
  );

  const tokenData = await response.json();
  if (response.status >= 400) throw Object.assign(new Error(), tokenData);
  return tokenData.access_token;
};

const getZoomUser = async access_token => {
  const response = await fetch('https://api.zoom.us/v2/users/me', {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  const userData = await response.json();
  if (response.status >= 400) throw Object.assign(new Error(), userData);
  return userData;
};

const createZoomMeeting = async (params, userId, access_token) => {
  const response = await fetch(`https://api.zoom.us/v2/users/${userId}/meetings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify(params),
  });

  const meetingData = await response.json();
  if (response.status >= 400) throw Object.assign(new Error(), meetingData);
  return meetingData;
};

const calculateApiCalls = weeklyDays => {
  const totalMeetings = weeklyDays.length * 52;
  return totalMeetings <= 60 ? 1 : Math.ceil(totalMeetings / 60);
};

const calculateRemainingMeetings = (weeklyDays, seriesNumber) => {
  const totalMeetings = weeklyDays.length * 52; // Total meetings for a year
  return totalMeetings - seriesNumber * 60; // Subtract meetings already created
};

const createAdditionalMeetings = async (
  lastMeetingDate,
  params,
  userId,
  access_token,
  seriesNumber,
  weeklyDays
) => {
  const remainingMeetings = calculateRemainingMeetings(weeklyDays, seriesNumber);

  if (remainingMeetings <= 0) return null;

  const nextStartDate = moment(lastMeetingDate)
    .tz(params.timezone)
    .add(7, 'days');

  const newParams = {
    ...params,
    start_time: nextStartDate.format('YYYY-MM-DDTHH:mm:ssZ'),
    recurrence: {
      type: 2,
      repeat_interval: 1,
      weekly_days: weeklyDays.map(day => day.value).join(','),
      end_times: Math.min(60, remainingMeetings),
    },
  };

  const newMeeting = await createZoomMeeting(newParams, userId, access_token);

  return newMeeting;
};

// Main Function
module.exports = async (req, res) => {
  const { code, backurl: backURL } = req.query;

  try {
    // Validate parameters
    if (!code || !backURL) return res.redirect(ERROR_PAGE_URL);

    const listingId = backURL.split('/')?.[3];
    if (!listingId) return res.redirect(ERROR_PAGE_URL);

    // Get Zoom token and user details
    const access_token = await getZoomToken(code, backURL);
    const zoomUser = await getZoomUser(access_token);

    // Get listing details
    const sdk = getSdk(req, res);
    const integrationSdk = getIntegrationSdk();

    let listingResponse = await sdk.ownListings.show({ id: listingId });
    listingResponse = denormalizeResponseData(listingResponse);
    const listing = listingResponse.data;

    const { startDate, timezone: listingTimezone, classDuration, weeklyDays, paymentType } =
      listing?.attributes?.publicData ?? {};

    // Calculate duration
    const duration =
      {
        '30_min': 30,
        '60_min': 60,
        '90_min': 90,
      }[classDuration.key] || 60;

    // Prepare meeting parameters
    const isRecurring = paymentType.some(type => type.value === 'recurring');
    const meetingParams = {
      start_time: moment.tz(startDate, listingTimezone).format('YYYY-MM-DDTHH:mm:ssZ'),
      timezone: listingTimezone,
      type: isRecurring ? 8 : 2,
      duration,
      topic: listing.attributes.title.slice(0, 199),
    };
    let allMeetingUrls = [];
    let initialMeeting;
    let lastMeeting;
    let lastClass;
    if (isRecurring) {
      meetingParams.recurrence = {
        type: 2,
        repeat_interval: 1,
        weekly_days: weeklyDays.map(day => day.value).join(','),
        end_times: 60,
      };

      const apiCallsNeeded = calculateApiCalls(weeklyDays);
      console.log(`Need ${apiCallsNeeded} API calls for ${weeklyDays.length} weekly meetings`);
      console.log('Array initialized:', allMeetingUrls);
      initialMeeting = await createZoomMeeting(meetingParams, zoomUser.id, access_token);
      allMeetingUrls.push({
        start_url: initialMeeting.start_url,
        join_url: initialMeeting.join_url,
        start_date: initialMeeting.occurrences[0].start_time,
        end_date: initialMeeting.occurrences[initialMeeting.occurrences.length - 1].start_time,
      });

      let currentMeeting = initialMeeting;
      for (let i = 1; i < apiCallsNeeded; i++) {
        const nextMeeting = await createAdditionalMeetings(
          currentMeeting.occurrences[currentMeeting.occurrences.length - 1].start_time,
          meetingParams,
          zoomUser.id,
          access_token,
          i,
          weeklyDays
        );

        if (nextMeeting && nextMeeting.occurrences?.length > 0) {
          allMeetingUrls.push({
            start_url: nextMeeting.start_url,
            join_url: nextMeeting.join_url,
            start_date: nextMeeting.occurrences[0].start_time,
            end_date: nextMeeting.occurrences[nextMeeting.occurrences.length - 1].start_time,
          });
          currentMeeting = nextMeeting;
        }
      }
      lastClass = moment(
        currentMeeting.occurrences[currentMeeting.occurrences.length - 1].start_time
      ).unix();
    } else {
      initialMeeting = await createZoomMeeting(meetingParams, zoomUser.id, access_token);
      allMeetingUrls.push({
        start_url: initialMeeting.start_url,
        join_url: initialMeeting.join_url,
        start_date: meetingParams.start_time,
        end_date: meetingParams.start_time,
      });
      lastMeeting = initialMeeting;
      lastClass = moment(meetingParams.start_time).unix();
    }

    // Update listing with meeting URLs
    await integrationSdk.listings.update({
      id: listingId,
      privateData: {
        zoom: {
          series: allMeetingUrls,
        },
      },
      publicData: {
        timeUpdated: false,
        lastClass: lastClass,
      },
    });
    return res.redirect(`${ROOT_URL}${backURL}`);
  } catch (err) {
    console.error(err);
    return res.redirect(ERROR_PAGE_URL);
  }
};
