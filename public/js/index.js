import 'core-js';
import 'regenerator-runtime/runtime';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';
import axios from 'axios';
const stripe = require('stripe')(
  'pk_test_51PROQXIQVsIi8CVD8lxUYKyx9z4Vsa1B25T059hz05JZKlG3txwAivE8ZUxPwM4tTzBczuQttjJkqg9jFIPTsb8c00HdSWRWfH',
);

// DOM Elements
const mapBox = document.getElementById('map');
// const loginForm = document.querySelector('.form');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (userDataForm)
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);

    updateSettings(form, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password',
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    console.log('btn clicked');

    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset;
    console.log('tourID ' + tourId);

    try {
      // 1) Get checkout session from API
      fetch(
        `http://127.0.0.1:8000/api/v1/bookings/create-checkout-session/${tourId}`,
        {
          method: 'POST',
        },
      )
        .then((res) => {
          if (res.ok) return res.json();
          return res.json().then((json) => Promise.reject(json));
        })

        // .then(({ url }) => {
        //   // console.log(url);
        //   window.location = url;
        // });

        // 2) Create checkout form + chanre credit card
        // await stripe.redirectToCheckhout(session.url);

        .then(
          stripe.redirectToCheckout({
            sessionId: session.data.session.id,
          }),
        );
    } catch (err) {
      console.log(err);
      // showAlert('error', err);
    }
  });
