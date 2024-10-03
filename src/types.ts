export type VideoFile = {
  rendition: string;
  type: string;
  width: number;
  height: number;
  link: string;
};

export type ChapterVideo = {
  duration: number;
  width: number;
  height: number;
  files: VideoFile[];
};

export type ShowcaseVideo = ChapterVideo & {
  uri: string;
  name: string;
  description: string | null;
  type: "video";
  link: string;
  player_embed_url: string;
  language: string;
  is_playable: boolean;
  has_audio: boolean;
};

export type Video = ChapterVideo | ShowcaseVideo;

export interface VimeoChapter {
  uri: string;
  title: string;
  timecode: number;
  thumbnails: [];
  index?: number;
}

export interface NotionChapter {
  type: string;
  text: { content: string };
  annotations: {
    bold: boolean;
    italic: boolean;
    strikethrough: boolean;
    underline: boolean;
    code: boolean;
    color: string;
  };
  plain_text: string;
}
[];

export interface NotionChapters {
  [key: string]: NotionChapter;
}

export type Playlist = {
  uuid: string;
  order: number;
  titleColor: string;
  notionChapters: NotionChapters;
  videoTitle: string;
  vimeoShowcaseID: string;
  videoShowCasePayload: {
    total: number;
    data: ShowcaseVideo[];
  };
  vimeoVideoID?: number;
  vimeoPlaybackPayload: ChapterVideo;
  vimeoChaptersPayload: {
    total: number;
    data: VimeoChapter[];
  };
};

export type PlaylistVideo = {
  uuid: string;
  vimeoPlayerURL: string;
  videoChapters: object[];
  order: number;
  videoTitle: string;
  titleColor: string;
};

export interface NotionResponse {
  blocks: Block[];
}

export interface Block {
  object: BlockObject;
  id: string;
  type: Type;
  createdTime: Date;
  lastEditedTime: Date;
  createdBy: TedBy;
  lastEditedBy: TedBy;
  paragraph?: Paragraph;
  image?: Image;
  divider?: Divider;
}

export interface TedBy {
  object: CreatedByObject;
  id: string;
}

export enum CreatedByObject {
  User = "user",
}

export interface Divider {}

export interface Image {
  type: string;
  file: File;
}

export interface File {
  url: string;
  expiryTime: Date;
}

export enum BlockObject {
  Block = "block",
}

export interface Paragraph {
  richText: RichText[];
  color: Color;
}

export enum Color {
  Default = "default",
}

export interface RichText {
  type: string;
  text: Text;
  annotations: Annotations;
  plainText: string;
}

export interface Annotations {
  bold: boolean;
  italic: boolean;
  strikethrough: boolean;
  underline: boolean;
  code: boolean;
  color: Color;
}

export interface Text {
  content: string;
}

export enum Type {
  Divider = "divider",
  Image = "image",
  Paragraph = "paragraph",
}

export interface TimeUpdate {
  duration: number;
  percent: number;
  seconds: number;
}
