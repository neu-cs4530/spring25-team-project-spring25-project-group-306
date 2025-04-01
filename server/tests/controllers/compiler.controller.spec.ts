import supertest from 'supertest';
import axios from 'axios';
import { app } from '../../app';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('POST /execute', () => {
  it('should execute code and return the result', async () => {
    const mockReqBody = {
      script: 'print("Hello, World!")',
      language: 'python3',
      versionIndex: '3',
    };

    const mockResponse = {
      output: 'Hello, World!\n',
      statusCode: 200,
      memory: '123456',
      cpuTime: '0.01',
    };

    mockedAxios.post.mockResolvedValueOnce({ data: mockResponse });

    const response = await supertest(app).post('/execute').send(mockReqBody);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockResponse);
  });

  it('should return an error if the request body is missing', async () => {
    const response = await supertest(app).post('/execute').send();

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Error executing code' });
  });

  it('should return an error if the axios request fails', async () => {
    const mockReqBody = {
      script: 'print("Hello, World!")',
      language: 'python3',
      versionIndex: '3',
    };

    mockedAxios.post.mockRejectedValueOnce(new Error('Axios request failed'));

    const response = await supertest(app).post('/execute').send(mockReqBody);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Error executing code' });
  });
});
