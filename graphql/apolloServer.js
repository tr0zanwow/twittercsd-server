const { ApolloServer, PubSub, withFilter } = require("apollo-server-express");
const pubsub = new PubSub();
const expressApp = express();

module.exports = {
    pubsub,
    withFilter,
    ApolloServer,
    expressApp
}