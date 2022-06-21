declare interface ImageDataSetItem {
  group: string;
  image: string;
  id: string;
}

declare type ImageDataManifest = { data: ImageDataSetItem }[];

declare interface ImageQuestItem {
  id: string;
  question: string;
  label: string;
  value: string;
}

declare interface UserRecord {
  id: number;
  username: string;
  password: string;
}

declare interface QuestRecord {
  id: number;
  uuid: string;
  uid: number;
  group: string;
  qid: string;
  answer: string;
}

declare interface QuestGroupProcessItem {
  name: string;
  cnt: number;
  rest: number;
}

declare interface QuestItem {
  uuid: string;
  qid: string;
  quest: string;
  image: string;
}

declare interface QuestAnswerItem extends QuestItem {
  answer: boolean;
}
