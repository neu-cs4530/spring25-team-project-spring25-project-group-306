import AWS from "aws-sdk";
import { ObjectId } from "mongodb";
import dotenv from 'dotenv';

dotenv.config();

const accessKeyId = process.env.AWS_ACCESS_KEY_ID || "";
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || "";
const region = process.env.AWS_REGION || "";
const bucketName = process.env.AWS_S3_BUCKET_NAME || "";
const bucketRegion = process.env.AWS_REGION || "";

export const uploadImageToAWS = async (file: Express.Multer.File): Promise<string | null> => {

    const s3 = new AWS.S3({
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
        region: region,
    });
    
    const params = {
        Bucket: bucketName,
        Key: new ObjectId().toString() + file.originalname,
        Body: file.buffer,
        ContentType: file.mimetype,
    };
    
    try {
        await s3.upload(params).promise();
        return `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${params.Key}`;
    } catch (error) {
        console.log(error);
        return null;
    }
}