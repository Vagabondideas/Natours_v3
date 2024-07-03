const stripe = require('stripe')(
  'sk_test_51PROQXIQVsIi8CVDCWrFdfG9faNJj4fC7Nipu9dM3bz7b4i8PxBY0kRmz8NQ5bbvmHWAYCMm84zuPH4rIGiMTnd5006tIyIJ38',
);
const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utilities/catchAsync');
const factory = require('./factoryController');

exports.createCheckoutSession = catchAsync(async (req, res, next) => {
  console.log('Checkout called');
  // 1) Get the currently booked tour and User info from the protect middleware in the router
  const tour = await Tour.findById(req.params.tourId);
  // TROUBLESHOOD make sure details about the tour and the user are available with concole.log
  // console.log(tour);
  // console.log(req.user);

  // 2) Create checkout session
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tour.name} Tour`,

              images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
              description: tour.summary,
            },
            unit_amount: tour.price * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
        req.params.tourId
      }&user=${req.user.id}&price=${tour.price}`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
      // success_url: `${process.env.SERVER_URL}/success.html`,
      // cancel_url: `${process.env.SERVER_URL}/cancel.html`,
    });

    // 3) Create session as response
    res.json({ url: session.url });
    console.log(session.url);

    // res.status(200).json({
    //   status: 'success',
    //   session,
    // });
  } catch (e) {
    res.status(500).json({ error: e.message });
    console.log('could not run stripe checkout');
  }
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
