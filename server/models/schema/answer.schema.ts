import { Schema } from 'mongoose';
/**
 * Mongoose schema for the Answer collection.
 *
 * This schema defines the structure for storing answers in the database.
 * Each answer includes the following fields:
 * - `text`: The content of the answer.
 * - `ansBy`: The username of the user who provided the answer.
 * - `ansDateTime`: The date and time when the answer was given.
 * - `comments`: Comments that have been added to the answer by users.
 * - 'upvotes': The usernames of the users who have upvoted the answer.
 * - 'downvotes': The usernames of the users who have downvoted the answer.
 * - `image`: An optional field for storing an image associated with the answer.
 */
const answerSchema: Schema = new Schema(
  {
    text: {
      type: String,
    },
    ansBy: {
      type: String,
    },
    ansDateTime: {
      type: Date,
    },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    image: {
      type: String,
      required: false,
    },
    upVotes: [{ type: String }],
    downVotes: [{ type: String }],
  },
  { collection: 'Answer' },
);

export default answerSchema;
