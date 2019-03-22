import reCAPTCHA from 'recaptcha2';

export default new reCAPTCHA({
  siteKey: 'notNeeded',
  secretKey: process.env.RECAPTCHA_SECRET_KEY
});