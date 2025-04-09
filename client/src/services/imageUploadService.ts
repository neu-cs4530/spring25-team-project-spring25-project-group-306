import api from './config';

const IMAGE_UPLOAD_API_URL = `${process.env.REACT_APP_SERVER_URL}/imageUpload`;

/**
 * Uploads an image file to the server and returns the public URL of the uploaded image.
 *
 * @param file - The image file to be uploaded.
 * @returns A promise that resolves to the public URL of the uploaded image.
 *
 * @throws Will throw an error if the upload process encounters an issue.
 */
const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post(`${IMAGE_UPLOAD_API_URL}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  if (res.status !== 200) {
    throw new Error('Error while uploading image');
  }

  return res.data.imageUrl;
};
export default uploadImage;
