const express = require('express');
const bodyParser = require ('body-parser');
const twitterWebhooks = require('twitter-webhooks');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./schemas.js')
const resolvers = require('./resolvers.js')
const cors = require('cors')
const app = express();
const socket = require('socket.io')

const server = new ApolloServer({ typeDefs, resolvers, introspection: true, playground: true });

app.use(bodyParser.json());

app.use(cors({ origin: '*'}));

const userActivityWebhook = twitterWebhooks.userActivity({
  serverUrl: 'https://'+process.env.HEROKU_APP_NAME+'.herokuapp.com',
  route: '/twitter',
  consumerKey: process.env.TWITTER_CONSUMER_KEY,
  consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  environment: process.env.TWITTER_DEV_ENVIRONMENT,
  app
});

// app.get('/registerWebhook', (req, res) => {
//   // async () =>{
//   //   const promise = userActivityWebhook.register();
//   //   const dataReceived = await promise;
//   //   console.log(dataReceived)
//   // }
//   res.send("hello")

// });

      const promise = userActivityWebhook.getWebhook();
      console.log('Available Webhooks')
      console.log(promise)
    
// userActivityWebhook.subscribe({
//   userId: process.env.TWITTER_USER_ID,
//   accessToken: process.env.TWITTER_ACCESS_TOKEN,
//   accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET
// })
// .then(function (userActivity) {
//   userActivity
//   .on('favorite', (data) => console.log (userActivity.id + ' - favorite'))
//   .on ('tweet_create', (data) => console.log (userActivity.id + ' - tweet_create'))
//   .on ('follow', (data) => console.log (userActivity.id + ' - follow'))
//   .on ('mute', (data) => console.log (userActivity.id + ' - mute'))
//   .on ('revoke', (data) => console.log (userActivity.id + ' - revoke'))
//   .on ('direct_message', (data) => console.log (userActivity.id + ' - direct_message'))
//   .on ('direct_message_indicate_typing', (data) => console.log (userActivity.id + ' - direct_message_indicate_typing'))
//   .on ('direct_message_mark_read', (data) => console.log (userActivity.id + ' - direct_message_mark_read'))
//   .on ('tweet_delete', (data) => console.log (userActivity.id + ' - tweet_delete'))
// });

// //listen to any user activity
// userActivityWebhook.on ('event', (event, userId, data) => console.log (userId + ' - favorite'));

app.use(express.static(__dirname + '/node_modules'));
app.get('/', function(req, res,next) {
    res.sendFile(__dirname + '/index.html');
});

server.applyMiddleware({ app });

const PORT = process.env.PORT || 4000;
const expressServer = app.listen(PORT, () => {
  let host = expressServer.address().address;
  let port = expressServer.address().port;

  console.log(`Listening at http://${host}:${port}`);
});

var io = socket(expressServer);

io.on('connection', (socket) => {
  console.log('made socket connection', socket.id);
  socket.on('join', function(data) {
    console.log(data);
    socket.emit('messages', 'Hello from server');
});
});

io.on('disconnect', (socket) => {
  console.log('disconnected connection', socket.id);
});
