const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');

const authRoutes        = require('./auth');
const listingsRoutes    = require('./listings');
const transactionRoutes = require('./transactions');
const stripeRoutes      = require('./stripe');
const zoomRoutes        = require('./zoom');
const usersRoutes       = require('./users');

const router = express.Router();

router.use(passport.initialize());
router.use('/stripe/webhook', express.raw({ type: 'application/json' }));
router.use(bodyParser.json({ limit: '10mb' }));
router.use(bodyParser.urlencoded({ extended: true }));

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/listings', listingsRoutes);
router.use('/own-listings', listingsRoutes);
router.use('/stripe', stripeRoutes);
router.use('/checkout-stripe-recurring', stripeRoutes);
router.use('/create-stripe-product-and-price', stripeRoutes);
router.use('/cancel-stripe-recurring', stripeRoutes);
router.use('/', zoomRoutes);
router.use('/', transactionRoutes);
router.use('/transactions', transactionRoutes);

router.post('/sign-up', (req, res, next) => {
  req.url = '/signup';
  authRoutes(req, res, next);
});

router.get('/current-user', (req, res, next) => {
  req.url = '/current-user';
  authRoutes(req, res, next);
});

router.patch('/current-user', (req, res, next) => {
  req.url = '/current-user';
  authRoutes(req, res, next);
});

module.exports = router;