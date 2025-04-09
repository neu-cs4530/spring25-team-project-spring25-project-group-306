import AWS from 'aws-sdk';
import { ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID || '';
const SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY || '';
const REGION = process.env.AWS_REGION || '';
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || '';

/**
 * Uploads an image file to an AWS S3 bucket and returns the public URL of the uploaded file.
 *
 * @param file - The file object provided by Multer middleware, containing the image to be uploaded.
 * @returns A promise that resolves to the public URL of the uploaded image, or `null` if the upload fails.
 *
 * @throws Will log an error to the console if the upload process encounters an issue.
 */
const uploadImageToAWS = async (file: Express.Multer.File): Promise<string | null> => {
  const s3 = new AWS.S3({
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
    region: REGION,
  });

  const params = {
    Bucket: BUCKET_NAME,
    Key: new ObjectId().toString(),
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  try {
    await s3.upload(params).promise();
    return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${params.Key}`;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error); // logging to console for error tracking
    return null;
  }
};

export default uploadImageToAWS;
