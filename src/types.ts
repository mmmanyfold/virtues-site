export type PlaylistVideo = {
  uuid: string;
  vimeoId: string;
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
