const { getSdk, getIntegrationSdk } = require('../api-util/sdk');
const { to } = require('./promise-helpers');
const getCurrentMeetingUrls = zoomData => {
  // Handle old format
  if (zoomData.start_url || zoomData.join_url) {
    return {
      start_url: zoomData.start_url,
      join_url: zoomData.join_url,
    };
  }

  // Handle new series format
  if (zoomData.series?.length) {
    // Sort series by start date
    const sortedSeries = [...zoomData.series].sort(
      (a, b) => new Date(a.start_date) - new Date(b.start_date)
    );

    const now = new Date();
    console.log('Current time:', now.toISOString());

    // Find active series based on current date
    const activeSeries = sortedSeries.find(series => {
      const startDate = new Date(series.start_date);
      const endDate = new Date(series.end_date);
      const isActive = now >= startDate && now <= endDate;
      console.log(`Checking series:`, {
        start: series.start_date,
        end: series.end_date,
        isActive,
      });
      return isActive;
    });

    // If no active series, get upcoming or first series
    if (!activeSeries) {
      const upcomingSeries = sortedSeries.find(series => {
        const startDate = new Date(series.start_date);
        return now < startDate;
      });

      // Return upcoming series or last series if after all dates
      if (!upcomingSeries && now > new Date(sortedSeries[sortedSeries.length - 1].end_date)) {
        return sortedSeries[sortedSeries.length - 1];
      }

      return upcomingSeries || sortedSeries[0];
    }

    return activeSeries;
  }

  return null;
};
const testMeetingUrlSelection = zoomData => {
  const testDates = [
    new Date('2024-12-31'), // Before all series
    new Date('2025-01-15'), // First series
    new Date('2025-03-15'), // Second series
    new Date('2025-06-01'), // Third series
    new Date('2025-08-01'), // Fourth series
    new Date('2025-10-01'), // Fifth series
    new Date('2025-12-15'), // Sixth series
    new Date('2026-02-03'), // Last series
    new Date('2026-02-06'), // After all series
  ];

  const RealDate = Date;
  testDates.forEach(testDate => {
    const MockDate = class extends RealDate {
      constructor(...args) {
        if (args.length === 0) {
          return new RealDate(testDate);
        }
        return new RealDate(...args);
      }
      static now() {
        return testDate.getTime();
      }
    };

    global.Date = MockDate;

    const urls = getCurrentMeetingUrls(zoomData);
    console.log('\nTest Results:');
    console.log('Current Date:', testDate.toISOString());
    console.log(
      'Found Series:',
      urls
        ? {
            start: urls.start_date,
            end: urls.end_date,
            isActive: testDate >= new Date(urls.start_date) && testDate <= new Date(urls.end_date),
          }
        : 'No series found'
    );
    console.log('------------------------');
  });

  global.Date = RealDate;
};
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

  const meetingUrls = getCurrentMeetingUrls(zoom);
  // testMeetingUrlSelection(zoom);

  if (!meetingUrls) {
    return res.status(400).json({
      message: 'No valid meeting URLs found.',
    });
  }

  if (currentUserId == customerId) {
    return res.status(200).json({
      join_url: meetingUrls.join_url,
    });
  }

  if (currentUserId == providerId) {
    return res.status(200).json({
      start_url: meetingUrls.start_url,
    });
  }

  return res.status(400).json({
    message: 'Failed to fetch zoom links. Unauthorized request.',
  });
};
