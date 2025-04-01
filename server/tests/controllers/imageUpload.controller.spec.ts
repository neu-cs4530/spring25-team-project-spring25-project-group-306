import supertest from 'supertest';
import { app } from '../../app';
import uploadImageToAWS from '../../services/imageUpload.service';

jest.mock('../../services/imageUpload.service');
const mockedUploadImageToAWS = uploadImageToAWS as jest.MockedFunction<typeof uploadImageToAWS>;

describe('POST /imageUpload', () => {
  it('should upload an image and return the image URL', async () => {
    const mockImageUrl = 'https://example-bucket.s3.amazonaws.com/uploads/test-image.jpg';

    // Mock the AWS upload service to return a URL
    mockedUploadImageToAWS.mockResolvedValueOnce(mockImageUrl);

    // Simulate a file upload using supertest
    const response = await supertest(app)
      .post('/imageUpload')
      .attach('file', Buffer.from('dummy file content'), 'test-image.jpg');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ imageUrl: mockImageUrl });
    expect(mockedUploadImageToAWS).toHaveBeenCalledTimes(1);
  });

  it('should return an error if no file is provided', async () => {
    const response = await supertest(app).post('/imageUpload');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Error uploading image' });
  });

  it('should return an error if the AWS upload fails', async () => {
    mockedUploadImageToAWS.mockResolvedValueOnce(null);

    const response = await supertest(app)
      .post('/imageUpload')
      .attach('file', Buffer.from('dummy file content'), 'test-image.jpg');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Error uploading image' });
    expect(mockedUploadImageToAWS).toHaveBeenCalledTimes(1);
  });

  it('should return an error if an exception occurs', async () => {
    mockedUploadImageToAWS.mockRejectedValueOnce(new Error('AWS upload failed'));

    const response = await supertest(app)
      .post('/imageUpload')
      .attach('file', Buffer.from('dummy file content'), 'test-image.jpg');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Error uploading image' });
    expect(mockedUploadImageToAWS).toHaveBeenCalledTimes(1);
  });
});
