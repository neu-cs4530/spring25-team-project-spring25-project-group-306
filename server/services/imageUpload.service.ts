import AWS from 'aws-sdk';
import { ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || '';
const SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';
const REGION = process.env.AWS_REGION || '';
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';

const uploadImageToAWS = async (file: Express.Multer.File): Promise<string | null> => {
  const s3 = new AWS.S3({
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
    region: REGION,
  });

  const params = {
    Bucket: BUCKET_NAME,
    Key: new ObjectId().toString() + file.originalname,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    await s3.upload(params).promise();
    return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${params.Key}`;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error); // proper logging of error
    return null;
  }
};

export default uploadImageToAWS;
