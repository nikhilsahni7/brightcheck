declare module "twitter-api-v2" {
  interface TweetData {
    id: string;
    text: string;
    created_at?: string;
    author_id?: string;
    public_metrics?: {
      retweet_count: number;
      reply_count: number;
      like_count: number;
      quote_count: number;
    };
    entities?: {
      hashtags?: Array<{ tag: string }>;
      mentions?: Array<{ username: string }>;
      urls?: Array<{ url: string; expanded_url: string }>;
    };
  }

  interface UserData {
    id: string;
    name: string;
    username: string;
    verified?: boolean;
  }

  interface TweetResponse {
    data: TweetData;
    includes?: {
      users?: UserData[];
      tweets?: TweetData[];
    };
  }

  class TwitterApi {
    constructor(bearerToken: string);
    v2: {
      singleTweet(
        tweetId: string,
        options?: {
          expansions?: string[];
          "tweet.fields"?: string[];
          "user.fields"?: string[];
        }
      ): Promise<TweetResponse>;
    };
  }

  export = TwitterApi;
}
