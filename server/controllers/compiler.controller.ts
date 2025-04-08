import axios from 'axios';
import express, { Request, Response, Router } from 'express';

const JDOODLE_API_URL = 'https://api.jdoodle.com/v1/execute';
const CLIENT_ID = 'e399c7b149f48f5545400db501d4266c';
const CLIENT_SECRET = '6b114d6c8810d0eb1580b2ee1b0e43a5c4ef712be99287ec803f3e5d30a317a4';

/**
 * Compiler controller for executing code using JDoodle API.
 *
 * @returns {Router} The router for handling compiler-related requests.
 */
const compilerController = () => {
  const router: Router = express.Router();

  /**
   * Executes code using JDoodle API.
   *
   * @param {Request} req - The request object containing the code to execute.
   * @param {Response} res - The response object to send the result.
   */
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
