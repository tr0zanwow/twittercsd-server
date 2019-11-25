const Twit = require('twit');

const client = new Twit({
  consumer_key:         'jC5tNNJX78KEsIG8EQRGF4KTd',
  consumer_secret:      'u4AE7ImFH0VZCTbdUWQqvIrYdEzcUFPwcxhFcyH0Wm8CCio1wW',
  app_only_auth:        true,
  timeout_ms:           60*1000,
  strictSSL:            true,
  });

  
  const resolvers = {
    Query: { 
      search: {
        async resolve(_,args) {
          let promise = new Promise((resolve, reject) => {
            client.get('search/tweets', { q: args.query, count: args.count,tweet_mode: 'extended'}, (err, data, response)=>resolve(data.statuses))
          });
          const searchData = await promise
          return searchData;
      }
    },
    getTimeline: {
      async resolve(_,args) {
        let promise = new Promise((resolve, reject) => {
          client.get('statuses/user_timeline', { [args.identifier]:args.value,count: args.count, tweet_mode: 'extended'}, (err, data, response)=>resolve(data))
        });
        const timeLineData = await promise
        console.log(timeLineData)
        return timeLineData;
    }
  },
      user: {
        async resolve(_,args) {
          let promise = new Promise((resolve, reject) => {
            client.get('users/show', { [args.identifier]:args.value}, (err, data, response)=>resolve(data))
          });
          const getUserData = await promise
          return getUserData;
      }
    }
  },
    Mutation: {
      postTweet: {
        async resolve(_,args) {
          let promise = new Promise((resolve, reject) => {
            const tClient = new Twit({
              consumer_key:         'jC5tNNJX78KEsIG8EQRGF4KTd',
              consumer_secret:      'u4AE7ImFH0VZCTbdUWQqvIrYdEzcUFPwcxhFcyH0Wm8CCio1wW',
              access_token:          args.access_token,
              access_token_secret:   args.access_token_secret,
              timeout_ms:           60*1000,
              strictSSL:            true,
              });
              tClient.post('statuses/update', { status: args.statusText, in_reply_to_status_id: args.inReplyToID}, (err, data, response)=>resolve(data))
          });
          const postTweetResponse = await promise
          return postTweetResponse;
      }
    }
    }
}

module.exports = resolvers;