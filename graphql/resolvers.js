const twitInstance = require("../twitter/modules/twitInstance");
const Twit = require('twit');
const { pubsub, withFilter } = require("../graphql/apolloServer");

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
      getTweets:{
        async resolve(_,args){
          let custTweetObjProm = new Promise((resolve, reject) => {
            twitInstance.get('search/tweets', { q: 'to:'+args.to+ ' from:'+args.from, max_id: args.max_id, result_type: 'mixed', tweet_mode: "extended", count: 10 }, function(err, data, response) {
              if(data.statuses.length || data.statuses.length && data.search_metadata.next_results == null){
              var tweetsWithReplies = [];
              data.statuses.forEach(tweet => {
                var replyTweets = [];
                var myDate = new Date(tweet.created_at);
                var dateStr = myDate.toLocaleString().split(",")[0].split("/");
                var date = dateStr[2]+"-"+dateStr[0]+"-"+dateStr[1];
            
                twitInstance.get('search/tweets', { q: 'to:'+args.from+ ' from:'+args.to+' since:'+date,result_type: 'mixed',tweet_mode: "extended", count: 100 }, function(err, data, response) {
                  if(data.statuses.length){
                    data.statuses.forEach(tweetReply =>{
                      if(tweet.id_str === tweetReply.in_reply_to_status_id_str){
                        var tempStruct = {
                              id_str: tweetReply.id_str,
                              full_text: tweetReply.full_text,
                              created_at: tweetReply.created_at
                            }
                            replyTweets.push(tempStruct)
                      }
                    })
                  }
              })
              var tempGroup = {
                id_str: tweet.id_str,
                created_at: tweet.created_at,
                full_text: tweet.full_text,
                replies: replyTweets
              }
                tweetsWithReplies.push(tempGroup)
              });
              var newTweetObj = {
                max_id: data.search_metadata.next_results.split('=')[1].split('&')[0],
                data : tweetsWithReplies
              }
              resolve(newTweetObj)
            }
            else if(data.search_metadata.next_results == null && data.statuses.length == 0){
              var newTweetObj = {
                max_id: null,
                data : []
              }
              resolve(newTweetObj)
            }
          })
          })

          const custTweetData = await custTweetObjProm;
          return custTweetData;
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