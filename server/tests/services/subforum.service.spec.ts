import mongoose from 'mongoose';
import SubforumModel from '../../models/subforums.model';
import {
  saveSubforum,
  updateSubforumById,
  getSubforumById,
  getAllSubforums,
  deleteSubforumById,
} from '../../services/subforum.service';
import { DatabaseSubforum } from '../../types/types';

// eslint-disable-next-line @typescript-eslint/no-var-requirescl
const mockingoose = require('mockingoose');

describe('Subforum service', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('saveSubforum', () => {
    test('should successfully save a valid subforum', async () => {
      const mockSubforum = {
        title: 'Test Subforum',
        description: 'Test Description',
        moderators: ['mod1', 'mod2'],
        tags: ['tag1', 'tag2'],
        rules: ['rule1', 'rule2'],
      };

      const mockDBSubforum = {
        ...mockSubforum,
        _id: new mongoose.Types.ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        questionCount: 0,
        toObject: () => ({
          ...mockSubforum,
          _id: mockDBSubforum._id,
          createdAt: mockDBSubforum.createdAt,
          updatedAt: mockDBSubforum.updatedAt,
          isActive: true,
          questionCount: 0,
        }),
      };

      mockingoose(SubforumModel, 'create').toReturn(mockDBSubforum);

      const result = (await saveSubforum(mockSubforum)) as DatabaseSubforum;

      expect(result._id).toBeDefined();
      expect(result.title).toEqual(mockSubforum.title);
      expect(result.description).toEqual(mockSubforum.description);
      expect(result.moderators).toEqual(mockSubforum.moderators);
      expect(result.tags).toEqual(mockSubforum.tags);
      expect(result.rules).toEqual(mockSubforum.rules);
      expect(result.isActive).toBe(true);
      expect(result.questionCount).toBe(0);
    });

    test('should return error when no moderators provided', async () => {
      const mockSubforum = {
        title: 'Test Subforum',
        description: 'Test Description',
        moderators: [],
        tags: ['tag1', 'tag2'],
        rules: ['rule1', 'rule2'],
      };

      const result = await saveSubforum(mockSubforum);

      expect(result).toEqual({ error: 'At least one moderator is required' });
    });

    test('should return error when database operation fails', async () => {
      const mockSubforum = {
        title: 'Test Subforum',
        description: 'Test Description',
        moderators: ['mod1'],
        tags: ['tag1'],
        rules: ['rule1'],
      };

      jest.spyOn(SubforumModel, 'create').mockRejectedValueOnce(new Error('Database error'));

      const result = await saveSubforum(mockSubforum);

      expect(result).toEqual({ error: 'Error when saving a subforum: Database error' });
    });
  });

  describe('updateSubforumById', () => {
    test('should successfully update an existing subforum', async () => {
      const subforumId = new mongoose.Types.ObjectId().toString();
      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description',
        moderators: ['newMod'],
        tags: ['newTag'],
        rules: ['newRule'],
        isActive: false,
      };

      const mockUpdatedSubforum = {
        _id: subforumId,
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date(),
        questionCount: 0,
        toObject: () => ({
          _id: subforumId,
          ...updateData,
          createdAt: mockUpdatedSubforum.createdAt,
          updatedAt: mockUpdatedSubforum.updatedAt,
          questionCount: 0,
        }),
      };

      mockingoose(SubforumModel).toReturn(mockUpdatedSubforum, 'findByIdAndUpdate');

      const result = await updateSubforumById(subforumId, updateData);

      expect(result).not.toBeNull();
      if (result) {
        expect(result._id.toString()).toEqual(subforumId);
        expect(result.title).toEqual(updateData.title);
        expect(result.description).toEqual(updateData.description);
        expect(result.moderators).toEqual(updateData.moderators);
        expect(result.tags).toEqual(updateData.tags);
        expect(result.rules).toEqual(updateData.rules);
        expect(result.isActive).toBe(false);
      }
    });

    test('should return null when subforum not found', async () => {
      const subforumId = new mongoose.Types.ObjectId().toString();
      const updateData = {
        title: 'Updated Title',
      };

      jest.spyOn(SubforumModel, 'findByIdAndUpdate').mockResolvedValueOnce(null);

      const result = await updateSubforumById(subforumId, updateData);

      expect(result).toBeNull();
    });

    test('should return null when database operation fails', async () => {
      const subforumId = new mongoose.Types.ObjectId().toString();
      const updateData = {
        title: 'Updated Title',
      };

      jest
        .spyOn(SubforumModel, 'findByIdAndUpdate')
        .mockRejectedValueOnce(new Error('Database error'));

      const result = await updateSubforumById(subforumId, updateData);

      expect(result).toBeNull();
    });
  });

  describe('getSubforumById', () => {
    test('should successfully retrieve an existing subforum', async () => {
      const subforumId = new mongoose.Types.ObjectId().toString();
      const mockSubforum = {
        _id: subforumId,
        title: 'Test Subforum',
        description: 'Test Description',
        moderators: ['mod1'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        questionCount: 0,
        tags: [],
        rules: [],
        toObject: () => ({
          _id: subforumId,
          title: 'Test Subforum',
          description: 'Test Description',
          moderators: ['mod1'],
          createdAt: mockSubforum.createdAt,
          updatedAt: mockSubforum.updatedAt,
          isActive: true,
          questionCount: 0,
          tags: [],
          rules: [],
        }),
      };

      mockingoose(SubforumModel).toReturn(mockSubforum, 'findById');

      const result = await getSubforumById(subforumId);

      expect(result).not.toBeNull();
      if (result) {
        expect(result._id.toString()).toEqual(subforumId);
      }
    });

    test('should return null when subforum not found', async () => {
      const subforumId = new mongoose.Types.ObjectId().toString();

      jest.spyOn(SubforumModel, 'findById').mockResolvedValueOnce(null);

      const result = await getSubforumById(subforumId);

      expect(result).toBeNull();
    });

    test('should return null when database operation fails', async () => {
      const subforumId = new mongoose.Types.ObjectId().toString();

      jest.spyOn(SubforumModel, 'findById').mockRejectedValueOnce(new Error('Database error'));

      const result = await getSubforumById(subforumId);

      expect(result).toBeNull();
    });
  });

  describe('getAllSubforums', () => {
    test('should successfully retrieve all subforums', async () => {
      const mockSubforums: Array<DatabaseSubforum> = [
        {
          _id: new mongoose.Types.ObjectId().toString(),
          title: 'Subforum 1',
          description: 'Description 1',
          moderators: ['mod1'],
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          questionCount: 0,
          tags: [],
          rules: [],
        },
        {
          _id: new mongoose.Types.ObjectId().toString(),
          title: 'Subforum 2',
          description: 'Description 2',
          moderators: ['mod2'],
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          questionCount: 0,
          tags: [],
          rules: [],
        },
      ];

      mockingoose(SubforumModel).toReturn(mockSubforums, 'find');

      const result = await getAllSubforums();

      expect(result.length).toBe(2);
      expect(result[0]._id.toString()).toBe(mockSubforums[0]._id);
      expect(result[1]._id.toString()).toBe(mockSubforums[1]._id);
      expect(result[0].title).toBe(mockSubforums[0].title);
      expect(result[1].title).toBe(mockSubforums[1].title);
      expect(result[0].description).toBe(mockSubforums[0].description);
      expect(result[1].description).toBe(mockSubforums[1].description);
      expect(result[0].moderators).toEqual(mockSubforums[0].moderators);
      expect(result[1].moderators).toEqual(mockSubforums[1].moderators);
      expect(result[0].isActive).toBe(mockSubforums[0].isActive);
      expect(result[1].isActive).toBe(mockSubforums[1].isActive);
      expect(result[0].questionCount).toBe(mockSubforums[0].questionCount);
      expect(result[1].questionCount).toBe(mockSubforums[1].questionCount);
      expect(result[0].tags).toEqual(mockSubforums[0].tags);
      expect(result[1].tags).toEqual(mockSubforums[1].tags);
      expect(result[0].rules).toEqual(mockSubforums[0].rules);
      expect(result[1].rules).toEqual(mockSubforums[1].rules);
    });

    test('should return empty array when no subforums exist', async () => {
      mockingoose(SubforumModel).toReturn([], 'find');

      const result = await getAllSubforums();

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    test('should return empty array when database operation fails', async () => {
      jest.spyOn(SubforumModel, 'find').mockRejectedValueOnce(new Error('Database error'));

      const result = await getAllSubforums();

      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });

  describe('deleteSubforumById', () => {
    test('should successfully delete an existing subforum', async () => {
      const subforumId = new mongoose.Types.ObjectId().toString();
      const mockDeletedSubforum = {
        _id: subforumId,
        title: 'Test Subforum',
        toObject: () => ({
          _id: subforumId,
          title: 'Test Subforum',
        }),
      };

      mockingoose(SubforumModel).toReturn(mockDeletedSubforum, 'findByIdAndDelete');

      const result = await deleteSubforumById(subforumId);

      expect(result).toBe(true);
    });

    test('should return false when subforum not found', async () => {
      const subforumId = new mongoose.Types.ObjectId().toString();

      jest.spyOn(SubforumModel, 'findByIdAndDelete').mockResolvedValueOnce(null);

      const result = await deleteSubforumById(subforumId);

      expect(result).toBe(false);
    });

    test('should return false when database operation fails', async () => {
      const subforumId = new mongoose.Types.ObjectId().toString();

      jest
        .spyOn(SubforumModel, 'findByIdAndDelete')
        .mockRejectedValueOnce(new Error('Database error'));

      const result = await deleteSubforumById(subforumId);

      expect(result).toBe(false);
    });
  });
});
