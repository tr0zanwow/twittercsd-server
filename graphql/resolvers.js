const twitInstance = require("./twitter/modules/twitInstance");
const Twit = require('twit');
const { pubsub, withFilter } = require("./graphql/apolloServer");

const resolvers = {
    Query: {
      getTweetsFromUser: {
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
      getTweet:{
        async resolve(_, args) {
          let promise = new Promise((resolve, reject) => {
            twitInstance.get(
              "statuses/show",
              { id: args.id_str, trim_user: true },
              (err, data, response) => resolve(data)
            );
          });
          const tweetData = await promise;
          return tweetData;
        }
      },
      getUserList:{
        async resolve(_, args) {
          let promise = new Promise((resolve, reject) => {
            twitInstance.get("search/tweets",
              { q: args.query, count: args.count, tweet_mode: "extended" , max_id : args.max_id},
              (err, data, response) => resolve(data)
            );
          });
          
          const searchData = await promise;
          if(searchData.search_metadata.next_results == null){
            if(searchData.statuses != [])
            return searchData.statuses.filter((set => f => !set.has(f.user.id_str) && set.add(f.user.id_str))(new Set));
            else
            return [];
          }
          else{
            const sortedUsers = searchData.statuses.filter((set => f => !set.has(f.user.id_str) && set.add(f.user.id_str))(new Set));
            var max_id = searchData.search_metadata.next_results.split('=')[1].split('&')[0]
            var finalResult = {
              "max_id": max_id,
              "tweets": sortedUsers
            }
            return finalResult;
          }
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
        subscribe: withFilter(
          ()=> pubsub.asyncIterator([NEW_TWEET]),
          (payload,args)=>{
            return (payload.forUID === args.id_str)
          }
          )
        },
      tweetDeleteSub:{
        subscribe: ()=> pubsub.asyncIterator([DELETE_TWEET])
      }
    }
  };

  module.exports = resolvers;