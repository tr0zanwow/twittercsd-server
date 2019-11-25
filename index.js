const express = require('express');
const bodyParser = require ('body-parser');
const twitterWebhooks = require('twitter-webhooks');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./schemas.js')
const resolvers = require('./resolvers.js')
const cors = require('cors')
const app = express();
const socket = require('socket.io')
const https = require("https");
var users = [];

setInterval(function() {
  https.get("https://apollo-graphql-socket-node.herokuapp.com/");
}, 300000);

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

    // (async () =>{
    //       const promise = userActivityWebhook.register();
    //       const dataReceived = await promise;
    //       console.log('Register Webhooks')
    //       console.log(dataReceived)
    // })();

    // (async () =>{
    //       const promise = userActivityWebhook.getWebhook();
    //       const dataReceived = await promise;
    //       console.log('Available Webhooks')
    //       console.log(dataReceived)
    //     })();

    // (async () =>{
    //   const promise = userActivityWebhook.getSubscriptions();
    //   const dataReceived = await promise;
    //   console.log('Available Subscriptions')
    //   console.log(dataReceived)
    // })();


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
  
  socket.on('creds',function(data){
    console.log(data)
    const temp = {
      socketID : socket.id,
      twitterID : data.userTwitterId,
      accessToken : data.access_token,
      accessTokenSecret : data.access_secret
    }
    if(users.find(x => x.twitterID === data.userTwitterId)){
      var index1 = users.findIndex(x => x.twitterID === data.userTwitterId);
      users[index1] = temp;
  }
  else{
      users.push(temp)
  }
    console.log(users)

    (async function() {
      await userActivityWebhook.subscribe({
        userId: data.userTwitterId,
        accessToken: data.access_token,
        accessTokenSecret: data.access_secret
    })
    .then(function (userActivity) {
        
    });
      })();
  });

  userActivityWebhook.on ('event',function (event, userId, data){ 
    console.log (data)
  });
 
  socket.on('disconnect', () => {
      console.log('disconnected connection', socket.id);
    });
  });
