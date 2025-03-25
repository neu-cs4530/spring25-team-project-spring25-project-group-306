import axios from 'axios';
import express, { Request, Response, Router } from 'express';

const JDoodle_API_URL = 'https://api.jdoodle.com/v1/execute'
const clientId = 'e399c7b149f48f5545400db501d4266c'
const clientSecret = '6b114d6c8810d0eb1580b2ee1b0e43a5c4ef712be99287ec803f3e5d30a317a4'

const compilerController = () => {
  const router: Router = express.Router();

  const executeCode = async (req: Request, res: Response) => {
    try {
      const { script, language, versionIndex } = req.body;
      const response = await axios.post(JDoodle_API_URL, {
        clientId,
        clientSecret,
        script,
        language,
        versionIndex,
      });
  
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: "Error executing code" });
    }
  }

  router.post('/', executeCode);

  return router;
}

export default compilerController;