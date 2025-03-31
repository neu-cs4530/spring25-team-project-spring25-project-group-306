import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { CreateSubforumRequest, FakeSOSocket, UpdateSubforumRequest } from '../types/types';
import {
  saveSubforum,
  updateSubforumById,
  getSubforumById,
  getAllSubforums,
  deleteSubforumById,
} from '../services/subforum.service';
import { getUserByUsername } from '../services/user.service';

const subforumController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Validates the subforum object to ensure it contains all the necessary fields.
   * @param {CreateSubforumRequest['body']} subforum - The subforum object to validate
   * @returns {boolean} - True if the subforum is valid, false otherwise
   */
  const isSubforumValid = (subforum: CreateSubforumRequest['body']): boolean =>
    !!subforum.title &&
    !!subforum.description &&
    !!subforum.moderators &&
    Array.isArray(subforum.moderators) &&
    subforum.moderators.length > 0 &&
    subforum.moderators.every(moderator => typeof moderator === 'string' && moderator.length > 0);

  /**
   * Creates a new subforum.
   * @param {CreateSubforumRequest} req - The request object containing subforum data
   * @param {Response} res - The response object
   */
  const createSubforum = async (req: CreateSubforumRequest, res: Response): Promise<void> => {
    if (!req.body) {
      res.status(400).json({ error: 'No request body provided' });
      return;
    }

    if (!isSubforumValid(req.body)) {
      res.status(400).json({
        error:
          'Invalid subforum data. Title, description, and at least one moderator username are required.',
      });
      return;
    }

    try {
      // The first moderator in the list is considered the creator
      const username = req.body.moderators[0];
      if (!username) {
        res.status(401).json({ error: 'You must specify at least one moderator' });
        return;
      }

      const userResult = await getUserByUsername(username);
      if ('error' in userResult) {
        throw new Error(userResult.error);
      }

      // Check if user has enough karma
      if ((userResult.karma ?? 0) < 2) {
        res.status(403).json({ error: 'You need at least 2 karma to create a subforum' });
        return;
      }

      const result = await saveSubforum(req.body);
      if ('error' in result) {
        throw new Error(result.error);
      }
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create subforum' });
    }
  };

  /**
   * Updates an existing subforum.
   * @param {UpdateSubforumRequest} req - The request object containing update data
   * @param {Response} res - The response object
   */
  const updateSubforum = async (req: UpdateSubforumRequest, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid subforum ID' });
      return;
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      res.status(400).json({ error: 'No update data provided' });
      return;
    }

    // Validate moderators if they are being updated
    if (req.body.moderators) {
      if (!Array.isArray(req.body.moderators) || req.body.moderators.length === 0) {
        res.status(400).json({ error: 'At least one moderator username is required' });
        return;
      }
      if (
        !req.body.moderators.every(
          (moderator: string) => typeof moderator === 'string' && moderator.length > 0,
        )
      ) {
        res.status(400).json({ error: 'All moderator usernames must be non-empty strings' });
        return;
      }
    }

    try {
      const result = await updateSubforumById(id, req.body);
      if (!result) {
        res.status(404).json({ error: 'Subforum not found' });
        return;
      }
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update subforum' });
    }
  };

  /**
   * Retrieves a subforum by its ID.
   * @param {Request} req - The request object containing the subforum ID
   * @param {Response} res - The response object
   */
  const getSubforum = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid subforum ID' });
      return;
    }

    try {
      const result = await getSubforumById(id);
      if (!result) {
        res.status(404).json({ error: 'Subforum not found' });
        return;
      }
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch subforum' });
    }
  };

  /**
   * Retrieves all subforums.
   * @param {Request} req - The request object
   * @param {Response} res - The response object
   */
  const getSubforums = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await getAllSubforums();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch subforums' });
    }
  };

  /**
   * Deletes a subforum by its ID.
   * @param {Request} req - The request object containing the subforum ID
   * @param {Response} res - The response object
   */
  const deleteSubforum = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      res.status(400).json({ error: 'Invalid subforum ID' });
      return;
    }

    try {
      const result = await deleteSubforumById(id);
      if (!result) {
        res.status(404).json({ error: 'Subforum not found' });
        return;
      }
      res.status(200).json({ message: 'Subforum deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete subforum' });
    }
  };

  // Define routes
  router.post('/', createSubforum);
  router.put('/:id', updateSubforum);
  router.get('/:id', getSubforum);
  router.get('/', getSubforums);
  router.delete('/:id', deleteSubforum);

  return router;
};

export default subforumController;
