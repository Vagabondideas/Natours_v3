import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from API
    const response = await fetch(`/api/v1/bookings/checkout-session/${tourId}`);
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
