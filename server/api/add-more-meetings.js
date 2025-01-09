const fetch = require('cross-fetch');
const { getIntegrationSdk } = require('../api-util/sdk');
const moment = require('moment-timezone');
// Constants
const zoomClientId = process.env.REACT_APP_ZOOM_CLIENT_ID;
const zoomClientSecret = process.env.ZOOM_CLIENT_SECRET;
const ROOT_URL = process.env.REACT_APP_CANONICAL_ROOT_URL;
const ERROR_PAGE_URL = `${ROOT_URL}/zoom-error?error=true`;
const ROOT_API_URL = ROOT_URL === 'http://localhost:3000' ? 'http://localhost:3500' : ROOT_URL;

// Helper Functions
const getZoomToken = async code => {
  const data = `${zoomClientId}:${zoomClientSecret}`;
  const hash = Buffer.from(data, 'utf8').toString('base64');
  const fullRedirectUri = `${ROOT_API_URL}/api/auth/callback/zoom/extend`;

  console.log('Token request with redirect_uri:', fullRedirectUri);

  const response = await fetch(
    `https://zoom.us/oauth/token?grant_type=authorization_code&code=${code}&redirect_uri=${fullRedirectUri}`,
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
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
  const userData = await response.json();
  if (response.status >= 400) throw Object.assign(new Error(), userData);
  return userData;
};

const calculateRemainingMeetings = (weeklyDays, seriesNumber) => {
  const totalMeetings = weeklyDays.length * 52;
  const meetingsCreated = seriesNumber * 60;
  return totalMeetings - meetingsCreated;
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

  const nextStartDate = moment(lastMeetingDate).add(7, 'days');
  const newParams = {
    ...params,
    start_time: nextStartDate.format(),
    recurrence: {
      ...params.recurrence,
      end_times: Math.min(60, remainingMeetings),
    },
  };

  return await createZoomMeeting(newParams, userId, access_token);
};

const calculateApiCalls = weeklyDays => {
  const totalMeetings = weeklyDays.length * 52;
  return totalMeetings <= 60 ? 1 : Math.ceil(totalMeetings / 60);
};
module.exports = async (req, res) => {
  const { code, backUrl, state: listingId } = req.query;
  console.log(code, backUrl, listingId, 'code, backUrl, listingId');
  //   const ROOT_URL = process.env.REACT_APP_CANONICAL_ROOT_URL;

  try {
    // Get zoom access token
    const access_token = await getZoomToken(code, backUrl);
    const zoomUser = await getZoomUser(access_token);
    console.log('Zoom user:', zoomUser);
    console.log('Listing ID:', listingId);
    console.log(access_token, 'access_token');

    // Get listing data
    const integrationSdk = getIntegrationSdk();
    const listing = await integrationSdk.listings.show({ id: listingId });
    console.log('Listing:', listing);
    console.log(listing.data.data.attributes, 'listing.data');
    const { publicData, privateData } = listing.data.data.attributes;
    console.log('Public data:', publicData);
    const apiCallsNeeded = calculateApiCalls(publicData.weeklyDays);
    console.log(
      `Need ${apiCallsNeeded} API calls for ${publicData.weeklyDays.length} weekly meetings`
    );
    console.log(apiCallsNeeded, 'apiCallsNeeded');
    const duration = parseInt(publicData.classDuration.value.split('_')[0]);
    // Setup meeting params from last class date
    console.log(duration, 'duration');
    const meetingParams = {
      topic: listing.data.data.attributes.title,
      start_time: moment
        .unix(publicData.lastClass)
        .add(7, 'days')
        .format(),
      timezone: publicData.timezone,
      duration: duration, // Use extracted duration
      type: 8,
      recurrence: {
        type: 2,
        repeat_interval: 1,
        weekly_days: publicData.weeklyDays.map(day => day.value).join(','),
        end_times: 60,
      },
    };
    console.log(meetingParams, 'meetingParams');
    let allMeetingUrls = [...(privateData.zoom?.series || [])];
    let currentMeeting;
    console.log(allMeetingUrls, 'allMeetingUrls');
    // Create initial meeting
    const initialMeeting = await createZoomMeeting(meetingParams, zoomUser.id, access_token);
    allMeetingUrls.push({
      start_url: initialMeeting.start_url,
      join_url: initialMeeting.join_url,
      start_date: initialMeeting.occurrences[0].start_time,
      end_date: initialMeeting.occurrences[initialMeeting.occurrences.length - 1].start_time,
    });
    console.log();
    currentMeeting = initialMeeting;

    // Create additional meetings if needed
    for (let i = 1; i < apiCallsNeeded; i++) {
      const nextMeeting = await createAdditionalMeetings(
        currentMeeting.occurrences[currentMeeting.occurrences.length - 1].start_time,
        meetingParams,
        zoomUser.id,
        access_token,
        i,
        publicData.weeklyDays
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

    // Update listing with final data
    await integrationSdk.listings.update({
      id: listingId,
      privateData: {
        zoom: { series: allMeetingUrls },
      },
      publicData: {
        lastClass: moment(
          currentMeeting.occurrences[currentMeeting.occurrences.length - 1].start_time
        ).unix(),
      },
    });
    if (!initialMeeting?.occurrences?.length) {
      console.error('Failed to create initial zoom meeting');
      return res.redirect(ERROR_PAGE_URL);
    }

    // Add logging for successful creation
    console.log(`Created ${allMeetingUrls.length} new meetings`);
    console.log(
      'Last meeting date:',
      moment(currentMeeting.occurrences[currentMeeting.occurrences.length - 1].start_time).format(
        'YYYY-MM-DD HH:mm:ss'
      )
    );
    return res.redirect(`${ROOT_URL}/l/listing/${listingId}`);
  } catch (error) {
    console.error('Error extending meetings:', error);
    return res.redirect(ERROR_PAGE_URL);
  }
};
