/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = require('stripe')(
  'pk_test_51PROQXIQVsIi8CVD8lxUYKyx9z4Vsa1B25T059hz05JZKlG3txwAivE8ZUxPwM4tTzBczuQttjJkqg9jFIPTsb8c00HdSWRWfH',
);

export const bookTour = async () => {
  try {
    // 1) Get checkout session from API
    fetch(`http://127.0.0.1:8000/api/v1/bookings/create-checkout-session/`, {
      method: 'POST',
    })
      .then((res) => {
        if (res.ok) return res.json();
        return res.json().then((json) => Promise.reject(json));
      })
      .then(({ url }) => {
        // console.log(url);
        window.location = url;
      });

    // const session = await axios(
    //   `http://127.0.0.1:8000/api/v1/bookings/checkout-session/${tourId}`,
    // );

    // 2) Create checkout form + chanre credit card
    // await stripe.redirectToCheckhout(session.url);

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
