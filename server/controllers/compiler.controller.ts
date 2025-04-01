import axios from 'axios';
import express, { Request, Response, Router } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const JDOODLE_API_URL = process.env.JDOODLE_API_URL || '';
const CLIENT_ID = process.env.JDOODLE_CLIENT_ID || '';
const CLIENT_SECRET = process.env.JDOODLE_CLIENT_SECRET || '';

const compilerController = () => {
  const router: Router = express.Router();

  const executeCode = async (req: Request, res: Response) => {
    try {
      const { script, language, versionIndex } = req.body;
      const response = await axios.post(JDOODLE_API_URL, {
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        script,
        language,
        versionIndex,
      });

      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: 'Error executing code' });
    }
  };

  router.post('/', executeCode);

  return router;
};

export default compilerController;
