import express, { Request, Response } from 'express';
import { FakeSOSocket, CreateSubforumRequest } from '../types/types';
import { saveSubforum, updateSubforumById } from '../services/subforum.service';

const subforumController = (socket: FakeSOSocket) => {
  const router = express.Router();

  const isSubforumRequestValid = (req: CreateSubforumRequest): boolean => {
    const { title, description, moderators } = req.body;
    return (
      !!title && !!description && !!moderators && Array.isArray(moderators) && moderators.length > 0
    );
  };

  /**
   * Creates a new subforum.
   * @param req The incoming request containing subforum data.
   * @param res The response to send back to the client.
   * @returns The newly created subforum.
   * @throws {Error} Throws an error if the subforum creation fails.
   */
  const createSubforum = async (req: Request, res: Response) => {
    if (!isSubforumRequestValid(req.body)) {
      res.status(400).json({ error: 'Invalid subforum data' });
      return;
    }

    try {
      const createdSubforum = await saveSubforum(req.body);
      res.status(200).json(createdSubforum);
      return;
    } catch (error) {
      res.status(500).json({ error: 'Failed to create subforum' });
      return;
    }
  };

  const updateSubforum = async (req: Request, res: Response) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      res.status(400).json({ error: 'No data provided for update' });
      return;
    }

    const { title, description, moderators, tags, rules, isActive } = req.body;
    const updateData = {
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(moderators ? { moderators } : {}),
      ...(tags ? { tags } : {}),
      ...(rules ? { rules } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
      updatedAt: new Date(),
    };

    try {
      const updatedSubforum = await updateSubforumById(req.params.id, updateData);
      if (!updatedSubforum) {
        res.status(404).json({ error: 'Subforum not found' });
        return;
      }
      res.status(200).json(updatedSubforum);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update subforum' });
    }
  };

  const getSubforum = async (req: express.Request, res: express.Response) => {
    return res.status(501).send('Not implemented');
  };

  const getSubforums = async (req: express.Request, res: express.Response) => {
    return res.status(501).send('Not implemented');
  };

  const deleteSubforum = async (req: express.Request, res: express.Response) => {
    return res.status(501).send('Not implemented');
  };

  router.post('/subforums', createSubforum);
  router.put('/subforums/:id', updateSubforum);
  return router;
};
