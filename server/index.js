/**
 * This is the main server to run the production application.
 *
 * Running the server requires that `npm run build` is run so that the
 * production JS bundle can be imported.
 *
 * This server renders the requested URL in the server side for
 * performance, SEO, etc., and properly handles redirects, HTTP status
 * codes, and serving the static assets.
 *
 * When the application is loaded in a browser, the client side app
 * takes control and all the functionality such as routing is handled
 * in the client.
 */

// This enables nice stacktraces from the minified production bundle
require('source-map-support').install();

// Configure process.env with .env.* files
require('./env').configureEnv();

const http = require('http');
const https = require('https');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const enforceSsl = require('express-enforces-ssl');
const path = require('path');
const sharetribeSdk = require('sharetribe-flex-sdk');
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');
const sitemap = require('express-sitemap');
const passport = require('passport');
const auth = require('./auth');
const apiRouter = require('./apiRouter');
const wellKnownRouter = require('./wellKnownRouter');
const { getExtractors } = require('./importer');
const renderer = require('./renderer');
const dataLoader = require('./dataLoader');
const fs = require('fs');
const log = require('./log');
const { sitemapStructure } = require('./sitemap');
const csp = require('./csp');
const sdkUtils = require('./api-util/sdk');
const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');
const cors = require('cors');

const buildPath = path.resolve(__dirname, '..', 'build');
const env = process.env.REACT_APP_ENV;
const dev = process.env.REACT_APP_ENV === 'development';
const PORT = parseInt(process.env.PORT, 10);
const CLIENT_ID = process.env.REACT_APP_SHARETRIBE_SDK_CLIENT_ID;
const BASE_URL = process.env.REACT_APP_SHARETRIBE_SDK_BASE_URL;
const TRANSIT_VERBOSE = process.env.REACT_APP_SHARETRIBE_SDK_TRANSIT_VERBOSE === 'true';
const USING_SSL = process.env.REACT_APP_SHARETRIBE_USING_SSL === 'true';
const TRUST_PROXY = process.env.SERVER_SHARETRIBE_TRUST_PROXY || null;
const CSP = process.env.REACT_APP_CSP;
const cspReportUrl = '/csp-report';
const cspEnabled = CSP === 'block' || CSP === 'report';
const app = express();

const errorPage = fs.readFileSync(path.join(buildPath, '500.html'), 'utf-8');
const clientId = process.env.SHARETRIBE_INTEGRATION_CLIENT_ID;
const clientSecret = process.env.SHARETRIBE_INTEGRATION_CLIENT_SECRET;
const integrationSdk = flexIntegrationSdk.createInstance({
  clientId,
  clientSecret,
});
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const options = {
  auth: {
    api_key: process.env.SENDGRID_API_KEY,
  },
};


// const handlePaymentIntentSucceeded = async paymentIntent => {
//   try {
//     const { id, metadata, charges } = paymentIntent;

//     const chargeId = charges?.data[0]?.id;
//     const { transaction_id, stripeAccount, paymentMethod, type, userId, priceId } = metadata;
//     const isAffiliation = type == 'affiliation';
//     const isGiftCard = type == 'gift_card';
//     if (isGiftCard) {
//       await handleGiftCard(metadata);
//       return;
//     }
//     if (isAffiliation && userId) {
//       await integrationSdk.users.updateProfile({
//         id: userId,
//         metadata: {
//           affiliation: true,
//           affiliationPriceId: priceId,
//         },
//       });
//       console.log('affiliation updated successfully');
//     } else {
//       await integrationSdk.transactions.transition(
//         {
//           id: transaction_id,
//           transition: 'transition/confirm-payment',
//           params: {
//             metadata: {
//               payment_method: paymentMethod,
//               chargeId,
//             },
//           },
//         },
//         {
//           expand: true,
//         }
//       );

//       console.log('transitioned');
//     }
//   } catch (e) {
//     console.log(e?.data?.errors);
//   }
// };
const updateUserSubscriptionCreated = async dataObject => {
  try {
    // Extract metadata from the subscription object
    const { id, metadata, current_period_start, current_period_end } = dataObject || {};
    const { userId, transactionId, priceId, plan } = metadata || {};
    // Check if metadata exists and log it
    if (metadata) {
      console.log('Subscription Metadata:', metadata);
      console.log('Transaction ID:', transactionId);

      // Proceed with transitioning the transaction using the SDK
      await integrationSdk.transactions.transition(
        {
          id: transactionId,
          transition: 'transition/confirm-subscription',
          params: {
            metadata: {
              subscriptionId: id,
              current_period_end,
              current_period_start,
              plan,
              priceId,
              membership: true,
            },
          },
        },
        {
          expand: true,
        }
      );
      // Log success
      console.log('Transaction successfully transitioned.');
    } else {
      console.warn('No metadata found in subscription object.');
    }
  } catch (e) {
    // Log detailed error information for debugging
    console.error('Error transitioning transaction:', e?.data?.errors || e.message || e);
  }
};

const updateUserSubscriptionDeleted = async dataObject => {
  const { id, metadata } = dataObject || {};
  const { transactionId } = metadata || {};

  if (!transactionId) {
    console.error('No transactionId found in metadata.');
    return;
  }

  try {
    // Fetch the transaction details
    const transaction = await integrationSdk.transactions.show({ id: transactionId });
    console.log('Transaction status:', transaction.status);

    const lastTransition =
      transaction.data.data.attributes.lastTransition === 'transition/confirm-subscription';

    // Function to update transaction metadata
    const updateTransactionMetadata = async () => {
      return await integrationSdk.transactions.updateMetadata(
        {
          id: transactionId,
          metadata: {
            subscriptionId: null,
            oldSubscriptionId: id,
            membership: false,
          },
        },
        { expand: true }
      );
    };

    let result;
    if (lastTransition) {
      // Transition the transaction if the last transition is 'confirm-subscription'
      result = await integrationSdk.transactions.transition(
        {
          id: transactionId,
          transition: 'transition/cancel',
          params: {
            metadata: {
              subscriptionId: null,
              oldSubscriptionId: id,
              membership: false,
            },
          },
        },
        { expand: true }
      );
      console.log('Transaction successfully transitioned.');
    } else {
      // Update the transaction metadata if no transition is needed
      result = await updateTransactionMetadata();
      console.log('Transaction metadata updated successfully:', result);
    }
  } catch (error) {
    // Log detailed error information for debugging
    console.error(
      'Error updating transaction metadata:',
      error?.data?.errors || error.message || error
    );
  }
};
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      webhookSecret
    );
  } catch (err) {
    console.error(`⚠️  Webhook signature verification failed: ${err.message}`);
    return res.sendStatus(400); // Return 400 for failed signature verification
  }

  // Extract the Stripe object from the event
  const dataObject = event.data.object;

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        // Log the entire dataObject to inspect the structure
        console.log('Subscription Data Object:', dataObject);

        // Check metadata in case it's not present directly on dataObject
        const metadata = dataObject.metadata || dataObject.subscription_details?.metadata || {};
        console.log('Subscription Metadata:', metadata);

        await updateUserSubscriptionCreated(dataObject);
        break;
      case 'customer.subscription.updated':
        await updateUserSubscriptionCreated(dataObject);
        break;
      case 'customer.subscription.deleted':
        await updateUserSubscriptionDeleted(dataObject);
        break;
      default:
        console.warn(`Unhandled event type: ${event.type}`);
    }
    return res.sendStatus(200);
  } catch (e) {
    console.error(`Error processing event: ${e.message}`);
    return res.sendStatus(400);
  }
});
const transporter = nodemailer.createTransport(sgTransport(options));
// load sitemap and robots file structure
// and write those into files
sitemap(sitemapStructure()).toFile();

// Setup error logger
log.setup();
// Add logger request handler. In case Sentry is set up
// request information is added to error context when sent
// to Sentry.
app.use(log.requestHandler());

// The helmet middleware sets various HTTP headers to improve security.
// See: https://www.npmjs.com/package/helmet
// Helmet 4 doesn't disable CSP by default so we need to do that explicitly.
// If csp is enabled we will add that separately.

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

if (cspEnabled) {
  // When a CSP directive is violated, the browser posts a JSON body
  // to the defined report URL and we need to parse this body.
  app.use(
    bodyParser.json({
      type: ['json', 'application/csp-report'],
    })
  );

  // CSP can be turned on in report or block mode. In report mode, the
  // browser checks the policy and calls the report URL when the
  // policy is violated, but doesn't block any requests. In block
  // mode, the browser also blocks the requests.

  // In Helmet 4,supplying functions as directive values is not supported.
  // That's why we need to create own middleware function that calls the Helmet's middleware function
  const reportOnly = CSP === 'report';
  app.use((req, res, next) => {
    csp(cspReportUrl, USING_SSL, reportOnly)(req, res, next);
  });
}

// Redirect HTTP to HTTPS if USING_SSL is `true`.
// This also works behind reverse proxies (load balancers) as they are for example used by Heroku.
// In such cases, however, the TRUST_PROXY parameter has to be set (see below)
//
// Read more: https://github.com/aredo/express-enforces-ssl
//
if (USING_SSL) {
  app.use(enforceSsl());
}

// Set the TRUST_PROXY when running the app behind a reverse proxy.
//
// For example, when running the app in Heroku, set TRUST_PROXY to `true`.
//
// Read more: https://expressjs.com/en/guide/behind-proxies.html
//
if (TRUST_PROXY === 'true') {
  app.enable('trust proxy');
} else if (TRUST_PROXY === 'false') {
  app.disable('trust proxy');
} else if (TRUST_PROXY !== null) {
  app.set('trust proxy', TRUST_PROXY);
}

app.use(compression());
app.use('/static', express.static(path.join(buildPath, 'static')));
// server robots.txt from the root
app.use('/robots.txt', express.static(path.join(buildPath, 'robots.txt')));
app.use(cookieParser());

// These .well-known/* endpoints will be enabled if you are using FTW as OIDC proxy
// https://www.sharetribe.com/docs/cookbook-social-logins-and-sso/setup-open-id-connect-proxy/
// We need to handle these endpoints separately so that they are accessible by Flex
// even if you have enabled basic authentication e.g. in staging environment.
app.use('/.well-known', wellKnownRouter);

// Use basic authentication when not in dev mode. This is
// intentionally after the static middleware and /.well-known
// endpoints as those will bypass basic auth.
if (!dev) {
  const USERNAME = process.env.BASIC_AUTH_USERNAME;
  const PASSWORD = process.env.BASIC_AUTH_PASSWORD;
  const hasUsername = typeof USERNAME === 'string' && USERNAME.length > 0;
  const hasPassword = typeof PASSWORD === 'string' && PASSWORD.length > 0;

  // If BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD have been set - let's use them
  if (hasUsername && hasPassword) {
    app.use(auth.basicAuth(USERNAME, PASSWORD));
  }
}

// Initialize Passport.js  (http://www.passportjs.org/)
// Passport is authentication middleware for Node.js
// We use passport to enable authenticating with
// a 3rd party identity provider (e.g. Facebook or Google)
app.use(passport.initialize());

// Server-side routes that do not render the application
app.use('/api', apiRouter);

const noCacheHeaders = {
  'Cache-control': 'no-cache, no-store, must-revalidate',
};

// Instantiate HTTP(S) Agents with keepAlive set to true.
// This will reduce the request time for consecutive requests by
// reusing the existing TCP connection, thus eliminating the time used
// for setting up new TCP connections.
const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

app.get('/zoomverify/verifyzoom.html', (req, res) => {
  const filePath = path.join(__dirname, 'verifyzoom.html');
  return res.sendFile(filePath);
});

const middlewares = [
  express.json(),
  express.urlencoded({ extended: true }),
  bodyParser.raw({ type: 'application/json' }),
];

app.post('/deauthorize-zoom/:key', middlewares, async (req, res) => {
  const key = req.params?.key;
  const endpointKey = 'c0fa1bc00531bd78ef38c628449c5102aeabd49b5dc3a2a516ea6ea959d6658e';
  if (key != endpointKey) return res.status(403).end();
  console.log(req.body);

  return res.status(200).end();
});

app.post('/contact-us', bodyParser.json(), async (req, res) => {
  const { name, email, userType, message } = req.body;
  console.log('SENDGRID_SENDER_EMAIL:', process.env.SENDGRID_SENDER_EMAIL);
  console.log('Request received:', req.body);

  // Validate required fields
  if (!userType || !message || !name || !email) {
    return res.status(422).send({ message: 'Please fill all the fields' });
  }

  // Check environment variable
  if (!process.env.SENDGRID_SENDER_EMAIL) {
    console.error('Environment variable SENDGRID_SENDER_EMAIL is not set');
    return res
      .status(500)
      .send({ message: 'Server configuration error', success: false });
  }

  try {
    const mailBody = `
      <h3>
        The following user contacted via contact form:
      </h3>
      ${name ? `<strong>Name:</strong> ${name}` : ''} <br />
      ${email ? `<strong>Email:</strong> ${email}` : ''} <br/> 
      <strong>User type:</strong> ${userType} <br/> 
      <strong>Message:</strong> ${message} <br/>
    `;

    const sent = await transporter.sendMail({
      from: process.env.SENDGRID_SENDER_EMAIL, // Use a verified sender address
      to: 'contact@vivacity.studio',
      subject: 'Vivacity Contact Form Message',
      replyTo: email, // Add user email for reply-to
      text: `User Type: ${userType}\nMessage: ${message}`,
      html: mailBody,
    });

    console.log('Email sent:', sent);
    return res.status(200).send({ message: 'Message sent successfully', success: true });
  } catch (e) {
    console.error('Email sending error:', e.message);
    return res
      .status(500)
      .send({ message: 'Message sending failed', success: false });
  }
});
app.get('*', async (req, res) => {
  if (req.url.startsWith('/static/')) {
    // The express.static middleware only handles static resources
    // that it finds, otherwise passes them through. However, we don't
    // want to render the app for missing static resources and can
    // just return 404 right away.
    return res.status(404).send('Static asset not found.');
  }

  if (req.url === '/_status.json') {
    return res.status(200).send({ status: 'ok' });
  }

  const context = {};

  // Get handle to tokenStore
  // We check in unauthorized cases if requests have set tokens to cookies
  const tokenStore = sharetribeSdk.tokenStore.expressCookieStore({
    clientId: CLIENT_ID,
    req,
    res,
    secure: USING_SSL,
  });

  const baseUrl = BASE_URL ? { baseUrl: BASE_URL } : {};

  const sdk = sharetribeSdk.createInstance({
    transitVerbose: TRANSIT_VERBOSE,
    clientId: CLIENT_ID,
    httpAgent: httpAgent,
    httpsAgent: httpsAgent,
    tokenStore,
    typeHandlers: sdkUtils.typeHandlers,
    ...baseUrl,
  });

  if (req.url === '/trainers') {
    try {
      const users = await integrationSdk.users
        .query({
          pub_userType: 'teacher',
          meta_featured: true,
          sort: 'meta_sortingOrder',
          include: ['profileImage'],
          // 'fields.image': ['variants.landscape-crop', 'variants.landscape-crop2x'],
        })
        .then(res => {
          return res.data;
        });
      // console.log('users', users);
      return res.status(200).send(users);
    } catch (err) {
      console.log('trainers error', err);
    }
  }
  // Until we have a better plan for caching dynamic content and we
  // make sure that no sensitive data can appear in the prefetched
  // data, let's disable response caching altogether.
  res.set(noCacheHeaders);

  // Get chunk extractors from node and web builds
  // https://loadable-components.com/docs/api-loadable-server/#chunkextractor
  const { nodeExtractor, webExtractor } = getExtractors();

  // Server-side entrypoint provides us the functions for server-side data loading and rendering
  const nodeEntrypoint = nodeExtractor.requireEntrypoint();
  const { default: renderApp, matchPathname, configureStore, routeConfiguration } = nodeEntrypoint;

  dataLoader
    .loadData(req.url, sdk, matchPathname, configureStore, routeConfiguration)
    .then(preloadedState => {
      const html = renderer.render(req.url, context, preloadedState, renderApp, webExtractor);

      if (dev) {
        const debugData = {
          url: req.url,
          context,
        };
        console.log(`\nRender info:\n${JSON.stringify(debugData, null, '  ')}`);
      }

      if (context.unauthorized) {
        // Routes component injects the context.unauthorized when the
        // user isn't logged in to view the page that requires
        // authentication.
        sdk.authInfo().then(authInfo => {
          if (authInfo && authInfo.isAnonymous === false) {
            // It looks like the user is logged in.
            // Full verification would require actual call to API
            // to refresh the access token
            res.status(200).send(html);
          } else {
            // Current token is anonymous.
            res.status(401).send(html);
          }
        });
      } else if (context.forbidden) {
        res.status(403).send(html);
      } else if (context.url) {
        // React Router injects the context.url if a redirect was rendered
        res.redirect(context.url);
      } else if (context.notfound) {
        // NotFoundPage component injects the context.notfound when a
        // 404 should be returned
        res.status(404).send(html);
      } else {
        res.send(html);
      }
    })
    .catch(e => {
      log.error(e, 'server-side-render-failed');
      res.status(500).send(errorPage);
    });
});

// Set error handler. If Sentry is set up, all error responses
// will be logged there.
app.use(log.errorHandler());

if (cspEnabled) {
  // Dig out the value of the given CSP report key from the request body.
  const reportValue = (req, key) => {
    const report = req.body ? req.body['csp-report'] : null;
    return report && report[key] ? report[key] : key;
  };

  // Handler for CSP violation reports.
  app.post(cspReportUrl, (req, res) => {
    const effectiveDirective = reportValue(req, 'effective-directive');
    const blockedUri = reportValue(req, 'blocked-uri');
    const msg = `CSP: ${effectiveDirective} doesn't allow ${blockedUri}`;
    log.error(new Error(msg), 'csp-violation');
    res.status(204).end();
  });
}

app.listen(PORT, () => {
  const mode = dev ? 'development' : 'production';
  console.log(`Listening to port ${PORT} in ${mode} mode`);
  if (dev) {
    console.log(`Open http://localhost:${PORT}/ and start hacking!`);
  }
});
