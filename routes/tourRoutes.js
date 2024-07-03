const fs = require('fs');
const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

const router = express.Router();

// router.param('id', tourController.checkID);
// this middleware has been deleted from the tourControllers during refactoring

router.use('/:tourId/reviews', reviewRouter);

// Alias Tour - Get Top5-Cheap
router
  .route('/top5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

// Tour Stats Middleware
router.route('/tour-stats').get(tourController.getTourStats);

// Monthly-Plan Middleware
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan,
  );

// GEO-Query
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
// Could have made it with user queries, like so:  /tours-within?distance=233&center=-40,45&unit=mi
// But prefer to write URL like so:  /tours-within/233/center/-40,45/unit/mi

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

//GET ALL TOUR
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createTour,
  );

// GET TOUR (UPDATE)
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    // Addition of Image Shitt - lesson 204
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    // Resume necessary middleware
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

module.exports = router;
