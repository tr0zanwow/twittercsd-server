const { gql } = require('apollo-server-express');

const typeDefs = gql`
    type Query { 
      getTweetsFromUser(query: String!,count: Int!): [Tweets] 
      getTweets(from: String!, to: String!, max_id: String!): getTweetsCustom
      user(identifier: IdentityType!, value: String!): User
      getTimeline(identifier: IdentityType!,identity: String! count: Int!,access_token: String!, access_token_secret: String!): [Tweets]
      getUserList(query: String!,count: Int!,max_id: String!): customTweetObj
      getTweet(id_str: String!): Tweets

      }
    type Mutation {
      postTweet(statusText: String!, inReplyToID: String!, access_token: String!, access_token_secret: String!): Tweets
    }

    type Subscription{
      tweetCreateSub(id_str:String): Tweets
      tweetDeleteSub(id_str:String): Status
    }

    enum IdentityType{
      user_id
      screen_name
    }

    type Status{
      id: String
      user_id: String
    }

    type User {
      id_str: String
      name: String
      screen_name: String
      location: String
      description: String
      url: String
      followers_count: Int
      friends_count: Int
      created_at: String
      favourites_count: Int
      statuses_count: Int
      profile_image_url_https: String
    }

    type Tweets {
      created_at: String
      id_str: String
      text: String
      full_text: String
      in_reply_to_status_id_str: String
      user: User
    }

    type customTweetObj{
      tweets: [Tweets]
      max_id: String
    }

    type getTweetsCustom{
      max_id: String,
      data: [Tweets]
    }

    schema {
      query: Query
      mutation: Mutation
      subscription: Subscription
}
  `;

  module.exports = typeDefs;