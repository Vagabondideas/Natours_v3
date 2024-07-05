import { showAlert } from './alerts';

// import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe(
  'pk_test_51PROQXIQVsIi8CVD8lxUYKyx9z4Vsa1B25T059hz05JZKlG3txwAivE8ZUxPwM4tTzBczuQttjJkqg9jFIPTsb8c00HdSWRWfH',
);

// stripe.redirectToCheckout({ sessionId });

export const bookTour = async (tourId) => {
  console.log('bookTour called');
  try {
    // 1) Get checkout session from API
    const session = await fetch(`/api/v1/bookings/checkout-session/${tourId}`); //fetch this route (in bookingRoutes), will call createCheckoutSession handler in bookingController
    // const session = await response.json();
    console.log('Session URL at frontend from bookTour ' + session);

    // 2) Create checkout form + chanrge credit card
    stripe.redirectToCheckout({ session });
    console.log('re-directed with stripe');
    // if (session.url) {
    //   window.location.href = session.url;
    //   console.log('Session URL at frontend from bookTour ' + session.url);
    // } else {
    //   throw new Error('Session URL not found');
    // }
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
