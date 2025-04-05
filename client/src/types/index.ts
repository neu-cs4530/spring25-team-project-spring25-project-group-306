import { ObjectId } from 'mongodb';

export interface Tag {
  name: string;
  description: string;
}

export interface Question {
  _id: string;
  title: string;
  text: string;
  tags: Tag[];
  askedBy: string;
  askDateTime: Date;
  answers?: ObjectId[];
  subforumId?: string;
  pinned: boolean;
}
