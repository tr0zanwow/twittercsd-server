const { ApolloServer, pubsub, app } = require("./graphql/apolloServer");
const bodyParser = require("body-parser");
const webhooksInstance = require("./twitter/modules/webhook");
const typeDefs = require("./graphql/schemas");
const resolvers = require("./graphql/resolvers");
const cors = require("cors");
const https = require("https");
const http = require('http');
const NEW_TWEET = 'NEW_TWEET';
const DELETE_TWEET = 'DELETE_TWEET';

setInterval(function() {
  https.get("https://apollo-graphql-socket-node.herokuapp.com/");
}, 300000);

app.use(bodyParser.json());

app.use(cors());

webhooksInstance.on("event", function(event, userId, data) {
    if(event == 'tweet_create'){
      console.log(data);
      pubsub.publish(NEW_TWEET, { tweetCreateSub: data, forUID: userId });
    }
    else if(event == 'tweet_delete'){
      pubsub.publish(DELETE_TWEET, { tweetDeleteSub: data.status, forUID: userId });
    }
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

const port = process.env.PORT || 4000;
httpServer.listen(port, () => {
  console.log(`Server Started on port ${port}`)
})