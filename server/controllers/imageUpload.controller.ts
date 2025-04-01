import axios from 'axios';
import express, { Request, Response, Router } from 'express';
import AWS from 'aws-sdk';
import { ObjectId } from 'mongodb';
import { uploadImageToAWS } from '../services/imageUpload.service';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() })

const imageUploadController = () => {
    const router: Router = express.Router();

    const uploadImage = async (req: Request, res: Response) => {
        try {
            const file = req.file;

            if (!file) {
                throw new Error('No file provided for upload');
            }

            console.log('file aaaaaa: ', file);
            const imageURL = await uploadImageToAWS(file);
            if (!imageURL) {
                return res.status(500).json({ error: `Error uploading image` });
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
