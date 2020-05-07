const webhooksInstance = require("twitter-webhooks");

const userActivityWebhook = webhooksInstance.userActivity({
    serverUrl: "https://" + process.env.HEROKU_APP_NAME + ".herokuapp.com",
    route: "/twitter",
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    environment: process.env.TWITTER_DEV_ENVIRONMENT,
    app
  });

module.exports = userActivityWebhook;