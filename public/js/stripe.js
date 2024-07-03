/* eslint-disable */
// import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const response = await fetch(`/api/v1/bookings/checkout-session/${tourId}`);
    /*
    THIS METHOD (Std by Stripe and ChatGPT) WILL CAUSE ERROR, Not able to retrieve session
    const response = await fetch(
      `/api/v1/bookings/checkout-session/${tourId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    */

    const session = await response.json();

    // 2) Create checkout form + chanrge credit card
    if (session.url) {
      window.location.href = session.url;
    } else {
      throw new Error('Session URL not found');
    }
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
