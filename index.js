const express = require("express");
const bodyParser = require("body-parser");
const twitterWebhooks = require("twitter-webhooks");
const { ApolloServer, PubSub } = require("apollo-server-express");
const typeDefs = require("./schemas.js");
const cors = require("cors");
const twitInstance = require("./twitInstance");
const app = express();
const https = require("https");
const http = require('http');

const pubsub = new PubSub();
const PORT = 4000;

const NEW_TWEET = 'NEW_TWEET';

setInterval(function() {
  https.get("https://apollo-graphql-socket-node.herokuapp.com/");
}, 300000);

app.use(bodyParser.json());

app.use(cors({ origin: "*" }));

const userActivityWebhook = twitterWebhooks.userActivity({
  serverUrl: "https://" + process.env.HEROKU_APP_NAME + ".herokuapp.com",
  route: "/twitter",
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  environment: process.env.TWITTER_DEV_ENVIRONMENT,
  app
});

const resolvers = {
  Query: {
    search: {
      async resolve(_, args) {
        let promise = new Promise((resolve, reject) => {
          twitInstance.get(
            "search/tweets",
            { q: args.query, count: args.count, tweet_mode: "extended" },
            (err, data, response) => resolve(data.statuses)
          );
        });
        const searchData = await promise;
        return searchData;
      }
    },
    getTimeline: {
      async resolve(_, args) {
        let promise = new Promise((resolve, reject) => {
          const tClient = new Twit({
            consumer_key: process.env.TWITTER_CONSUMER_KEY,
            consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
            access_token: args.access_token,
            access_token_secret: args.access_token_secret,
            timeout_ms: 60 * 1000,
            strictSSL: true
          });
          tClient.get(
            "statuses/user_timeline",
            {
              [args.identifier]: args.value,
              count: args.count,
              tweet_mode: "extended"
            },
            (err, data, response) => resolve(data)
          );
        });
        const timeLineData = await promise;
        console.log(timeLineData);
        return timeLineData;
      }
    },
    user: {
      async resolve(_, args) {
        let promise = new Promise((resolve, reject) => {
          twitInstance.get(
            "users/show",
            { [args.identifier]: args.value },
            (err, data, response) => resolve(data)
          );
        });
        const getUserData = await promise;
        return getUserData;
      }
    }
  },
  Mutation: {
    postTweet: {
      async resolve(_, args) {
        let promise = new Promise((resolve, reject) => {
          const tClient = new Twit({
            consumer_key: process.env.TWITTER_CONSUMER_KEY,
            consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
            access_token: args.access_token,
            access_token_secret: args.access_token_secret,
            timeout_ms: 60 * 1000,
            strictSSL: true
          });
          tClient.post(
            "statuses/update",
            {
              status: args.statusText,
              in_reply_to_status_id: args.inReplyToID
            },
            (err, data, response) => resolve(data)
          );
        });
        const postTweetResponse = await promise;
        return postTweetResponse;
      }
    }
  },
  Subscription:{
    tweetCreateSub: {
      subscribe: ()=> pubsub.asyncIterator([NEW_TWEET])
    }
  }
};

userActivityWebhook.on("event", function(event, userId, data) {
      console.log(data);
      pubsub.publish(NEW_TWEET, { tweetCreateSub: data });
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: true
});

server.applyMiddleware({ app });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen(process.env.PORT || 4000, () => {})
