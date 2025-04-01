import api from './config';

const IMAGE_UPLOAD_API_URL = `${process.env.REACT_APP_SERVER_URL}/imageUpload`;

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
}
export default uploadImage;