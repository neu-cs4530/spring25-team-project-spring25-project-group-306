import express, { Request, Response, Router } from 'express';
import multer from 'multer';
import uploadImageToAWS from '../services/imageUpload.service';

const upload = multer({ storage: multer.memoryStorage() });

const imageUploadController = () => {
  const router: Router = express.Router();

  const uploadImage = async (req: Request, res: Response) => {
    try {
      const { file } = req;
      if (!file) {
        throw new Error('No file provided for upload');
      }

      const imageURL = await uploadImageToAWS(file);
      if (!imageURL) {
        res.status(500).json({ error: `Error uploading image` });
        return;
      }
      res.status(200).json({ imageUrl: imageURL });
    } catch (error) {
      res.status(500).json({ error: `Error uploading image` });
    }
  };

  router.post('/', upload.single('file'), uploadImage);

  return router;
};

export default imageUploadController;
