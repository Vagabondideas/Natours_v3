const express = require('express');
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');

const router = express.Router();

router.use(viewsController.alerts);

router.get('/', authController.isLoggedIn, viewsController.getOverview);

router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);

// GET MY TOUR WITHOUT CREATE BOOKING - AFTER HOOK
router.get(
  '/my-tours',
  authController.protect,
  bookingController.createBookingCheckout,
  viewsController.getMyTours,
);

/*
GET MY TOUR n CREATE BOOKING - BEFORE HOOK
**************************************************************
router.get(
  '/my-tours',
  bookingController.createBookingCheckout,
  authController.protect,
  viewsController.getMyTours,
  );
****************************************************************
*/

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData,
);

module.exports = router;
