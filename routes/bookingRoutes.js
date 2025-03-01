const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');
const Tour = require('../models/tourModel');

const router = express.Router();

router.use(authController.protect);
router.get(
  '/checkout-session/:tourId',
  bookingController.createCheckoutSession,
);
// router.post(
//   '/create-checkout-session',
//   bookingController.createCheckoutSession,
// );

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
