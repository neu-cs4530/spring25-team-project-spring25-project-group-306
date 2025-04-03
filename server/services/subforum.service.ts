import SubforumModel from '../models/subforums.model';
import {
  DatabaseSubforum,
  CreateSubforumRequest,
  UpdateSubforumRequest,
  SubforumWithRuntimeData,
} from '../types/types';
import { getUserByUsername } from './user.service';

// This will be set from the controller
let onlineUsersMap = new Map<string, number>();

/**
 * Updates the online users map reference
 * @param map The map of subforum IDs to online user counts
 */
export const setOnlineUsersMap = (map: Map<string, Set<string>>): void => {
  onlineUsersMap = new Map(
    Array.from(map.entries()).map(([subforumId, users]) => [subforumId, users.size]),
  );
};

/**
 * Adds runtime data (like online users count) to a subforum
 * @param subforum The subforum to enhance
 * @returns Subforum with runtime data
 */
const addRuntimeData = (subforum: DatabaseSubforum): SubforumWithRuntimeData => {
  const id = subforum._id.toString();
  return {
    ...subforum,
    onlineUsers: onlineUsersMap.get(id) || 0,
  };
};

/**
 * Saves a new subforum to the database.
 * @param {CreateSubforumRequest['body']} subforum - The subforum to save
 * @returns {Promise<DatabaseSubforum | { error: string }>} - The saved subforum or error message
 */
export const saveSubforum = async (
  subforum: CreateSubforumRequest['body'],
): Promise<DatabaseSubforum | { error: string }> => {
  try {
    // Validate moderator usernames
    if (!subforum.moderators || subforum.moderators.length === 0) {
      return { error: 'At least one moderator is required' };
    }

    // Check if the creator (first moderator) has enough karma
    const creatorUsername = subforum.moderators[0];
    const creator = await getUserByUsername(creatorUsername);

    if (!creator || 'error' in creator) {
      return { error: `Error finding creator: ${creator?.error}` };
    }

    if ((creator.karma ?? 0) < 2) {
      return { error: 'You need at least 2 karma to create a subforum' };
    }

    const result = await SubforumModel.create({
      ...subforum,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      questionCount: 0,
    });
    return result;
  } catch (error) {
    if (error instanceof Error) {
      return { error: `Error when saving a subforum: ${error.message}` };
    }
    return { error: 'Error when saving a subforum' };
  }
};

/**
 * Updates a subforum by its ID.
 * @param {string} id - The subforum ID
 * @param {UpdateSubforumRequest['body']} updateData - The data to update
 * @returns {Promise<DatabaseSubforum | null>} - The updated subforum or null if not found
 */
export const updateSubforumById = async (
  id: string,
  updateData: UpdateSubforumRequest['body'],
): Promise<DatabaseSubforum | null> => {
  try {
    // Create a new object for database update
    const dbUpdateData = {
      ...updateData,
      updatedAt: new Date(),
    };

    return await SubforumModel.findByIdAndUpdate(id, dbUpdateData, { new: true });
  } catch (error) {
    return null;
  }
};

/**
 * Retrieves a subforum by its ID.
 * @param {string} id - The subforum ID
 * @returns {Promise<SubforumWithRuntimeData | null>} - The subforum with runtime data or null if not found
 */
export const getSubforumById = async (id: string): Promise<SubforumWithRuntimeData | null> => {
  try {
    const subforum = await SubforumModel.findById(id);
    if (!subforum) return null;

    return {
      ...subforum.toObject(),
      onlineUsers: onlineUsersMap.get(id) || 0,
    };
  } catch (error) {
    return null;
  }
};

/**
 * Retrieves all subforums.
 * @returns {Promise<SubforumWithRuntimeData[]>} - List of all subforums with runtime data
 */
export const getAllSubforums = async (): Promise<SubforumWithRuntimeData[]> => {
  try {
    const subforums = await SubforumModel.find();
    return subforums.map(addRuntimeData);
  } catch (error) {
    return [];
  }
};

/**
 * Deletes a subforum by its ID.
 * @param {string} id - The subforum ID
 * @returns {Promise<boolean>} - True if deleted, false otherwise
 */
export const deleteSubforumById = async (id: string): Promise<boolean> => {
  try {
    const result = await SubforumModel.findByIdAndDelete(id);
    return result !== null;
  } catch (error) {
    return false;
  }
};
