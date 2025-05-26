declare module "rss-parser" {
  interface CustomItem {
    title?: string;
    link?: string;
    pubDate?: string;
    content?: string;
    contentSnippet?: string;
    guid?: string;
    categories?: string[];
    author?: string;
    [key: string]: any;
  }

  interface CustomFeed {
    title?: string;
    description?: string;
    link?: string;
    language?: string;
    lastBuildDate?: string;
    creator?: string;
    items: CustomItem[];
    [key: string]: any;
  }

  class Parser {
    constructor(options?: any);
    parseURL(url: string): Promise<CustomFeed>;
    parseString(xml: string): Promise<CustomFeed>;
  }

  export = Parser;
}
