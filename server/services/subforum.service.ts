import SubforumModel from '../models/subforums.model';
import { DatabaseSubforum, Subforum, DatabaseUpdateSubforumRequest } from '../types/types';

/**
 * Saves a new subforum to the database.
 * @param {Subforum} subforum - The subforum to save
 * @returns {Promise<DatabaseSubforum | { error: string }>} - The saved subforum or error message
 */
export const saveSubforum = async (
  subforum: Subforum,
): Promise<DatabaseSubforum | { error: string }> => {
  try {
    // Validate moderator usernames
    if (!subforum.moderators || subforum.moderators.length === 0) {
      return { error: 'At least one moderator is required' };
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
 * @param {Partial<Subforum>} updateData - The data to update
 * @returns {Promise<DatabaseSubforum | null>} - The updated subforum or null if not found
 */
export const updateSubforumById = async (
  id: string,
  updateData: Partial<Subforum>,
): Promise<DatabaseSubforum | null> => {
  try {
    // Create a new object for database update
    const dbUpdateData: DatabaseUpdateSubforumRequest = {
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
 * @returns {Promise<DatabaseSubforum | null>} - The subforum or null if not found
 */
export const getSubforumById = async (id: string): Promise<DatabaseSubforum | null> => {
  try {
    return await SubforumModel.findById(id);
  } catch (error) {
    return null;
  }
};

/**
 * Retrieves all subforums.
 * @returns {Promise<DatabaseSubforum[]>} - List of all subforums
 */
export const getAllSubforums = async (): Promise<DatabaseSubforum[]> => {
  try {
    return await SubforumModel.find();
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
