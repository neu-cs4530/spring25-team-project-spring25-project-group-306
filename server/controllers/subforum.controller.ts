import { populateDocument } from '../utils/database.util';
import express, {Response} from 'express';
import { FakeSOSocket, CreateSubforumRequest } from '../types/types';
import { saveSubforum } from '../services/subforum.service'

const subforumController = (socket: FakeSOSocket) => {
    const router = express.Router();

    const isSubforumRequestValid = (req: CreateSubforumRequest): boolean => {
        const { title, description, moderators } = req.body;
        return !!title && !!description && !!moderators && Array.isArray(moderators) && moderators.length > 0;
    }

    /**
     * Creates a new subforum.
     * @param req The incoming request containing subforum data.
     * @param res The response to send back to the client.
     * @returns The newly created subforum.
     * @throws {Error} Throws an error if the subforum creation fails.
     */
    const createSubforum = async (req: CreateSubforumRequest, res: Response): Promise<void> => {
        if (!isSubforumRequestValid(req)) {
            res.status(400).json({ error: 'Invalid subforum data' });
            return;
        }

        const { title, description, moderators, tags, rules } = req.body;

        const newSubforum = {
            title,
            description,
            moderators,
            tags,
            rules,
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true
        }

        try {
            const createdSubforum = await saveSubforum({newSubforum});

            if ('error' in newSubforum) {
                res.status(500).json({ error: newSubforum.error });
                return;
            }

            socket.emit('subforumUpdate', {
                subforum: createdSubforum,
                type: 'created'
            });
            res.status(200).json(createdSubforum);  
            return;          
        } catch (error) {
            res.status(500).json({ error: 'Failed to create subforum' });
            return;
        }
    }

    const updateSubforum = async (req: express.Request, res: express.Response) => {
        return res.status(501).send('Not implemented');
    }

    const getSubforum = async (req: express.Request, res: express.Response) => {
        return res.status(501).send('Not implemented');
    }

    const getSubforums = async (req: express.Request, res: express.Response) => {
        return res.status(501).send('Not implemented');
    }

    const deleteSubforum = async (req: express.Request, res: express.Response) => {
        return res.status(501).send('Not implemented');
    }

    socket.on('connection', conn => {

    });

    router.post('/createSubforum', createSubforum);

    return router



};