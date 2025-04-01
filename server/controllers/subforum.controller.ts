import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { CreateSubforumRequest, FakeSOSocket, UpdateSubforumRequest } from '../types/types';
import {
  saveSubforum,
  updateSubforumById,
  getSubforumById,
  getAllSubforums,
  deleteSubforumById,
  setOnlineUsersMap,
} from '../services/subforum.service';

// Map to track online users count per subforum
const subforumOnlineUsers = new Map<string, Set<string>>();

const subforumController = (socket: FakeSOSocket) => {
  const router = express.Router();

  // Setup socket event handlers for tracking online users
  socket.on('connection', client => {
    // Handle user joining a subforum
    client.on('joinSubforum', (subforumId: string) => {
      const clientId = client.id;

      // Initialize subforum's online users set if it doesn't exist
      if (!subforumOnlineUsers.has(subforumId)) {
        subforumOnlineUsers.set(subforumId, new Set<string>());
      }

      // Add user to the subforum's online users
      const users = subforumOnlineUsers.get(subforumId)!;
      users.add(clientId);

      // Update the service with the current online users map
      setOnlineUsersMap(subforumOnlineUsers);

      // Broadcast updated online users count to all clients
      socket.emit('subforumOnlineUsers', {
        subforumId,
        onlineUsers: users.size,
      });
    });

    // Handle user leaving a subforum
    client.on('leaveSubforum', (subforumId: string) => {
      handleUserLeaveSubforum(client.id, subforumId);
    });

    // Handle user disconnection
    client.on('disconnect', () => {
      // Remove user from all subforums they were in
      subforumOnlineUsers.forEach((users, subforumId) => {
        if (users.has(client.id)) {
          handleUserLeaveSubforum(client.id, subforumId);
        }
      });
    });
  });

  /**
   * Handles a user leaving a subforum
   * @param clientId Client socket id
   * @param subforumId Subforum id
   */
  const handleUserLeaveSubforum = (clientId: string, subforumId: string): void => {
    if (subforumOnlineUsers.has(subforumId)) {
      const users = subforumOnlineUsers.get(subforumId)!;
      users.delete(clientId);

      // Update the service with the current online users map
      setOnlineUsersMap(subforumOnlineUsers);

      // Broadcast updated online users count
      socket.emit('subforumOnlineUsers', {
        subforumId,
        onlineUsers: users.size,
      });

      // Clean up if no users are online in this subforum
      if (users.size === 0) {
        subforumOnlineUsers.delete(subforumId);
      }
    }
  };

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
      const result = await saveSubforum(req.body);
      if ('error' in result) {
        if (result.error.includes('karma')) {
          res.status(403).json({ error: result.error });
          return;
        }
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
