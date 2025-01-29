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

const createZoomMeeting = async (params, userId, token) => {
  console.log('Meeting params:', JSON.stringify(params, null, 2));

  // Ensure single meeting has correct type and no recurrence
  if (params.type === 2) {
    params = {
      ...params,
      start_time: moment(params.start_time).format('YYYY-MM-DDTHH:mm:ssZ'),
      type: 2, // Scheduled meeting
      settings: {
        join_before_host: true,
        waiting_room: false,
      },
    };
  }

  const response = await fetch(`https://api.zoom.us/v2/users/${userId}/meetings`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  const meetingData = await response.json();
  console.log('Meeting response:', JSON.stringify(meetingData, null, 2));
  return meetingData;
};

const calculateApiCalls = weeklyDays => {
  // Calculate meetings for 6 months (26 weeks)
  const totalMeetings = weeklyDays.length * 26;

  // If total meetings <= 60, we need 1 API call but will set end_times to 26

  if (totalMeetings <= 60) {
    return {
      apiCalls: 1,
      endTimes: totalMeetings, // Exact number needed for 6 months
    };
  }

  // For more meetings, calculate needed API calls
  return {
    apiCalls: Math.ceil(totalMeetings / 60),
    endTimes: 60,
  };
};

const calculateRemainingMeetings = (weeklyDays, seriesNumber) => {
  const totalMeetings = weeklyDays.length * 26; // 6 months
  const meetingsCreated = seriesNumber * 60;
  const remaining = totalMeetings - meetingsCreated;
  return Math.max(0, Math.min(60, remaining));
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

  // const nextStartDate = moment(lastMeetingDate)
  //   .tz(params.timezone)
  //   .add(7, 'days');

  const newParams = {
    ...params,
    start_time: moment(lastMeetingDate)
      .tz(params.timezone)
      .add(7, 'days')
      .format('YYYY-MM-DDTHH:mm:ssZ'),
    recurrence: {
      ...params.recurrence,
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
      const { apiCalls, endTimes } = calculateApiCalls(weeklyDays);
      meetingParams.recurrence = {
        type: 2,
        repeat_interval: 1,
        weekly_days: weeklyDays.map(day => day.value).join(','),
        end_times: endTimes, // Use calculated endTimes
      };

      console.log(
        `Need ${apiCalls} API calls for ${weeklyDays.length} weekly meetings for 6 months`
      );
      initialMeeting = await createZoomMeeting(meetingParams, zoomUser.id, access_token);

      allMeetingUrls.push({
        start_url: initialMeeting.start_url,
        join_url: initialMeeting.join_url,
        start_date: initialMeeting.occurrences[0].start_time,
        end_date: initialMeeting.occurrences[initialMeeting.occurrences.length - 1].start_time,
      });

      let currentMeeting = initialMeeting;
      for (let i = 1; i < apiCalls; i++) {
        const remainingMeetings = calculateRemainingMeetings(weeklyDays, i);
        if (remainingMeetings <= 0) break;
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
