declare module "youtube-transcript" {
  interface TranscriptItem {
    text: string;
    duration: number;
    offset: number;
  }

  class YoutubeTranscript {
    static fetchTranscript(videoId: string): Promise<TranscriptItem[]>;
  }

  export = YoutubeTranscript;
}
