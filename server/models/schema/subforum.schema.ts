import { Schema } from 'mongoose';

/**
 * Mongoose schema for the Subforum collection.
 *
 * This schema defines the structure for storing subforums in the database.
 * Each Subforum includes the following fields:
 * - `title`: The title of the subforum.
 * - `description`: A description of the subforum's purpose and content.
 * - `moderators`: Array of usernames who have moderation privileges for this subforum.
 * - `createdAt`: The date when the subforum was created.
 * - `updatedAt`: The date when the subforum was last updated.
 * - `questionCount`: The number of questions in this subforum (optional).
 * - `tags`: Array of tag strings associated with this subforum (optional).
 * - `rules`: Array of rules specific to this subforum (optional).
 * - `isActive`: Whether the subforum is active or archived.
 * - `public`: Whether the subforum is public or private.
 * - `members`: Array of usernames who are members of this subforum (required for private subforums).
 */
const subforumSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    moderators: {
      type: [String],
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    questionCount: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    rules: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    public: {
      type: Boolean,
      default: true,
    },
    members: {
      type: [String],
      default: [],
    },
  },
  {
    collection: 'Subforum',
    timestamps: true, // This will automatically update createdAt and updatedAt
  },
);

export default subforumSchema;
