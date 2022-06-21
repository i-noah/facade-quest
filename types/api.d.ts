declare interface ImageDataSetItem {
  group: string;
  image: string;
  id: string;
}

declare type ImageDataManifest = { data: ImageDataSetItem }[];

declare interface ImageQuestItem {
  id: string;
  title: string;
  question: string;
  label: string;
  value: string;
  help: string;
}

declare interface UserRecord {
  id: number;
  username: string;
  password: string;
}

declare interface QuestRecord {
  id: number;
  /**
   * image id
   */
  uuid: string;
  /**
   * user id
   */
  uid: number;
  group: string;
  /**
   * quest id
   */
  qid: string;
  answer: string;
}

declare interface QuestGroupProcessItem extends ImageQuestItem {
  id: string;
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
