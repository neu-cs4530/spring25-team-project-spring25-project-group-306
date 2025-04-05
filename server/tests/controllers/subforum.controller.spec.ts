import supertest from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import * as subforumUtil from '../../services/subforum.service';
import { DatabaseSubforum, SubforumWithRuntimeData } from '../../types/types';

// Spy on all the service methods
const saveSubforumSpy = jest.spyOn(subforumUtil, 'saveSubforum');
const updateSubforumByIdSpy = jest.spyOn(subforumUtil, 'updateSubforumById');
const getSubforumByIdSpy = jest.spyOn(subforumUtil, 'getSubforumById');
const getAllSubforumsSpy = jest.spyOn(subforumUtil, 'getAllSubforums');
const deleteSubforumByIdSpy = jest.spyOn(subforumUtil, 'deleteSubforumById');

describe('Test subforumController', () => {
  describe('POST /', () => {
    it('should successfully create a new subforum', async () => {
      const mockSubforum = {
        title: 'Test Subforum',
        description: 'Test Description',
        moderators: ['mod1'],
        members: ['user1'],
        public: true,
      };

      const mockCreatedSubforum: DatabaseSubforum = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...mockSubforum,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        questionCount: 0,
        tags: [],
        rules: [],
      };

      saveSubforumSpy.mockResolvedValueOnce(mockCreatedSubforum);

      const response = await supertest(app).post('/subforums').send(mockSubforum);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        ...mockCreatedSubforum,
        createdAt: mockCreatedSubforum.createdAt.toISOString(),
        updatedAt: mockCreatedSubforum.updatedAt.toISOString(),
      });
    });

    it('should return 400 if no request body provided', async () => {
      const response = await supertest(app).post('/subforums').send();

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error:
          'Invalid subforum data. Title, description, and at least one moderator username are required.',
      });
    });

    it('should return 400 if title is missing', async () => {
      const mockSubforum = {
        description: 'Test Description',
        moderators: ['mod1'],
      };

      const response = await supertest(app).post('/subforums').send(mockSubforum);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid subforum data');
    });

    it('should return 400 if description is missing', async () => {
      const mockSubforum = {
        title: 'Test Subforum',
        moderators: ['mod1'],
      };

      const response = await supertest(app).post('/subforums').send(mockSubforum);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid subforum data');
    });

    it('should return 400 if moderators array is empty', async () => {
      const mockSubforum = {
        title: 'Test Subforum',
        description: 'Test Description',
        moderators: [],
      };

      const response = await supertest(app).post('/subforums').send(mockSubforum);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid subforum data');
    });

    it('should return 400 if private subforum has no members', async () => {
      const mockSubforum = {
        title: 'Test Subforum',
        description: 'Test Description',
        moderators: ['mod1'],
        public: false,
      };

      const response = await supertest(app).post('/subforums').send(mockSubforum);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid subforum data');
    });

    it('should return 500 if database operation fails', async () => {
      const mockSubforum = {
        title: 'Test Subforum',
        description: 'Test Description',
        moderators: ['mod1'],
      };

      saveSubforumSpy.mockResolvedValueOnce({ error: 'Database error' });

      const response = await supertest(app).post('/subforums').send(mockSubforum);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error:
          'Invalid subforum data. Title, description, and at least one moderator username are required.',
      });
    });
  });

  describe('PUT /:id', () => {
    it('should successfully update an existing subforum', async () => {
      const subforumId = new mongoose.Types.ObjectId().toString();
      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description',
        moderators: ['newMod'],
        members: ['user1', 'user2'],
        public: true,
      };

      const mockUpdatedSubforum: DatabaseSubforum = {
        _id: subforumId,
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        questionCount: 0,
        tags: [],
        rules: [],
      };

      updateSubforumByIdSpy.mockResolvedValueOnce(mockUpdatedSubforum);

      const response = await supertest(app).put(`/subforums/${subforumId}`).send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockUpdatedSubforum,
        createdAt: mockUpdatedSubforum.createdAt.toISOString(),
        updatedAt: mockUpdatedSubforum.updatedAt.toISOString(),
      });
    });

    it('should return 400 if invalid ID format', async () => {
      const response = await supertest(app).put('/subforums/invalid-id').send({
        title: 'Updated Title',
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid subforum ID' });
    });

    it('should return 400 if no update data provided', async () => {
      const subforumId = new mongoose.Types.ObjectId().toString();
      const response = await supertest(app).put(`/subforums/${subforumId}`).send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'No update data provided' });
    });

    it('should return 400 if moderators array is empty', async () => {
      const subforumId = new mongoose.Types.ObjectId().toString();
      const response = await supertest(app).put(`/subforums/${subforumId}`).send({
        moderators: [],
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'At least one moderator username is required' });
    });

    it('should return 400 if private subforum has no members', async () => {
      const subforumId = new mongoose.Types.ObjectId().toString();
      const response = await supertest(app).put(`/subforums/${subforumId}`).send({
        public: false,
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'At least one member username is required for private subforums',
      });
    });

    it('should return 404 if subforum not found', async () => {
      const subforumId = new mongoose.Types.ObjectId().toString();
      updateSubforumByIdSpy.mockResolvedValueOnce(null);

      const response = await supertest(app).put(`/subforums/${subforumId}`).send({
        title: 'Updated Title',
      });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Subforum not found' });
    });

    it('should return 500 if database operation fails', async () => {
      const subforumId = new mongoose.Types.ObjectId().toString();
      updateSubforumByIdSpy.mockRejectedValueOnce(new Error('Database error'));

      const response = await supertest(app).put(`/subforums/${subforumId}`).send({
        title: 'Updated Title',
      });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to update subforum' });
    });
  });

  describe('GET /:id', () => {
    it('should successfully retrieve a subforum', async () => {
      const subforumId = new mongoose.Types.ObjectId().toString();
      const mockSubforum: SubforumWithRuntimeData = {
        _id: subforumId,
        title: 'Test Subforum',
        description: 'Test Description',
        moderators: ['mod1'],
        members: ['user1'],
        public: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        questionCount: 0,
        tags: [],
        rules: [],
        onlineUsers: 0,
      };

      getSubforumByIdSpy.mockResolvedValueOnce(mockSubforum);

      const response = await supertest(app).get(`/subforums/${subforumId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockSubforum,
        createdAt: mockSubforum.createdAt.toISOString(),
        updatedAt: mockSubforum.updatedAt.toISOString(),
      });
    });

    it('should return 400 if invalid ID format', async () => {
      const response = await supertest(app).get('/subforums/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid subforum ID' });
    });

    it('should return 404 if subforum not found', async () => {
      const subforumId = new mongoose.Types.ObjectId().toString();
      getSubforumByIdSpy.mockResolvedValueOnce(null);

      const response = await supertest(app).get(`/subforums/${subforumId}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Subforum not found' });
    });

    it('should return 500 if database operation fails', async () => {
      const subforumId = new mongoose.Types.ObjectId().toString();
      getSubforumByIdSpy.mockRejectedValueOnce(new Error('Database error'));

      const response = await supertest(app).get(`/subforums/${subforumId}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch subforum' });
    });

    it('should successfully get a subforum by ID', async () => {
      const subforumId = new mongoose.Types.ObjectId().toString();
      const mockSubforum: SubforumWithRuntimeData = {
        _id: subforumId,
        title: 'Test Subforum',
        description: 'Test Description',
        moderators: ['mod1'],
        members: ['user1'],
        public: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        questionCount: 0,
        tags: [],
        rules: [],
        onlineUsers: 0,
      };

      getSubforumByIdSpy.mockResolvedValueOnce(mockSubforum);

      const response = await supertest(app).get(`/subforums/${subforumId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockSubforum,
        createdAt: mockSubforum.createdAt.toISOString(),
        updatedAt: mockSubforum.updatedAt.toISOString(),
      });
    });
  });

  describe('GET /', () => {
    it('should successfully retrieve all subforums', async () => {
      const mockSubforums: SubforumWithRuntimeData[] = [
        {
          _id: new mongoose.Types.ObjectId().toString(),
          title: 'Test Subforum 1',
          description: 'Test Description 1',
          moderators: ['mod1'],
          members: ['user1'],
          public: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          questionCount: 0,
          tags: [],
          rules: [],
          onlineUsers: 0,
        },
        {
          _id: new mongoose.Types.ObjectId().toString(),
          title: 'Test Subforum 2',
          description: 'Test Description 2',
          moderators: ['mod2'],
          members: ['user2'],
          public: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          questionCount: 0,
          tags: [],
          rules: [],
          onlineUsers: 0,
        },
      ];

      getAllSubforumsSpy.mockResolvedValueOnce(mockSubforums);

      const response = await supertest(app).get('/subforums');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        mockSubforums.map(subforum => ({
          ...subforum,
          createdAt: subforum.createdAt.toISOString(),
          updatedAt: subforum.updatedAt.toISOString(),
        })),
      );
    });

    it('should return empty array when no subforums exist', async () => {
      getAllSubforumsSpy.mockResolvedValueOnce([]);

      const response = await supertest(app).get('/subforums');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return 500 if database operation fails', async () => {
      getAllSubforumsSpy.mockRejectedValueOnce(new Error('Database error'));

      const response = await supertest(app).get('/subforums');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch subforums' });
    });
  });

  describe('DELETE /:id', () => {
    it('should successfully delete a subforum', async () => {
      const subforumId = new mongoose.Types.ObjectId().toString();
      deleteSubforumByIdSpy.mockResolvedValueOnce(true);

      const response = await supertest(app).delete(`/subforums/${subforumId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Subforum deleted successfully' });
    });

    it('should return 400 if invalid ID format', async () => {
      const response = await supertest(app).delete('/subforums/invalid-id');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Invalid subforum ID' });
    });

    it('should return 404 if subforum not found', async () => {
      const subforumId = new mongoose.Types.ObjectId().toString();
      deleteSubforumByIdSpy.mockResolvedValueOnce(false);

      const response = await supertest(app).delete(`/subforums/${subforumId}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Subforum not found' });
    });

    it('should return 500 if database operation fails', async () => {
      const subforumId = new mongoose.Types.ObjectId().toString();
      deleteSubforumByIdSpy.mockRejectedValueOnce(new Error('Database error'));

      const response = await supertest(app).delete(`/subforums/${subforumId}`);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to delete subforum' });
    });
  });
});
