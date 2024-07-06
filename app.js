const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./utilities/appError');
const globalErrorHandler = require('./controllers/errorController');

const viewRouter = require('./routes/viewRoutes');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingController = require('./controllers/bookingController'); //added for handler of route webhook-checkout
const bookingRouter = require('./routes/bookingRoutes');

const app = express();

app.set('trust proxy', false);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout,
);

// GLOBAL MIDDLEWARE
// ********************************************************
// CORS - Lesson 222
app.use(cors());
// Access-Control-Allow-Origin *
// api.natours.com, front-end natours.com
// app.use(cors({
//   origin: 'https://www.natours.com'
// }))

app.options('*', cors());
// app.options('/api/v1/tours/:id', cors());
// ***************************************************************

//Serving Static Files middleware - (eg.html, img, etc...)
app.use(express.static(path.join(__dirname, 'public')));

//Set Security HTTP Headers (Helmet)
app.use(helmet());
// app.use(helmet({ contentSecurityPolicy: false }));

//Development Logging (Morgan middleware) - HTTP Request Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate Limiter middleware - Limit req from same IP - Allow 100 request in 1 hour
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP. Try again later in an hour.',
});
app.use('/api', limiter);

// STRIPE WEBHOOK - ADDED LESSON 227 (Sec. 14 last lesson)
// ********************************************************************************************
// Stripe webhook, BEFORE body-parser, because stripe needs the body as stream
// NOTE: This route goes straight to the bookingController
// app.post(
//   '/webhook-checkout',
//   express.raw({ type: 'application/json' }),
//   bookingController.webhookCheckout,
// );

// *****************************************************************************************************

//BODY PARSER middleware - Reading data from body into req.body
app.use(express.json({ limit: '10kb' })); //Limit body size file to 10Kb - Lesson 144
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

//Data Sanitization against XSS
app.use(xss());

//WHITELIST - Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// Compression - Lesson 222
app.use(compression());

//Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// ROUTES (mounting the routers n separation of concerns)
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//ERROR Handling Middleware
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
