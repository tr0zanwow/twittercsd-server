const Twit = require('twit');

const client = new Twit({
  consumer_key:         'jC5tNNJX78KEsIG8EQRGF4KTd',
  consumer_secret:      'u4AE7ImFH0VZCTbdUWQqvIrYdEzcUFPwcxhFcyH0Wm8CCio1wW',
  app_only_auth:        true,
  timeout_ms:           60*1000,
  strictSSL:            true,
  });

module.exports = client;