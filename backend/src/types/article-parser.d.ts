declare module "article-parser" {
  interface Article {
    title?: string;
    content?: string;
    author?: string;
    published?: string;
    source?: string;
    url?: string;
    image?: string;
    language?: string;
    keywords?: string[];
    summary?: string;
  }

  export function extract(url: string): Promise<Article | null>;
}
