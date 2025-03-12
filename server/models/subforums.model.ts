import mongoose, { Model } from 'mongoose';
import subforumSchema from './schema/subforum.schema';
import { DatabaseSubforum } from '@fake-stack-overflow/shared/types/types';

/**
 * Mongoose model for the `Subforum` collection.
 *
 * This model is created using the `DatabaseSubforum` interface and the `subforumSchema`, representing the
 * `Subforum` collection in the MongoDB database, and provides an interface for interacting with
 * the stored subforums.
 *
 * @type {Model<DatabaseSubforum>}
 */
const SubforumModel: Model<DatabaseSubforum> = mongoose.model<DatabaseSubforum>(
  'Subforum',
  subforumSchema,
);

export default SubforumModel;
