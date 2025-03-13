import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});
const uploadImage = async (file: File) => {
  const params = {
    Bucket: process.env.REACT_APP_AWS_S3_BUCKET_NAME || '',
    Key: `uploads/${file.name}`,
    Body: await file.arrayBuffer(),
    ContentType: file.type,
  };

  try {
    await s3.upload(params).promise();
    return `https://${process.env.REACT_APP_AWS_S3_BUCKET_NAME}.s3.${process.env.REACT_APP_AWS_REGION}.amazonaws.com/uploads/${file.name}`;
  } catch (error) {
    return null;
  }
};

export default uploadImage;
