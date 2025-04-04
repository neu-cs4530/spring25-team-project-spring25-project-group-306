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


// Mock the user service
jest.mock('../../services/user.service');
const getUserByUsernameMock = userService.getUserByUsername as jest.MockedFunction<
  typeof userService.getUserByUsername
>;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

interface MockSubforumWithToObject {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  moderators: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  questionCount: number;
  tags: string[];
  rules: string[];
  toObject: () => DatabaseSubforum;
}

describe('Subforum service', () => {
  beforeEach(() => {
    mockingoose.resetAll();
    jest.clearAllMocks();
    jest.clearAllMocks();
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

      // Mock the user service to return a valid user with karma
      getUserByUsernameMock.mockResolvedValueOnce({
        username: 'mod1',
        karma: 3,
        _id: new mongoose.Types.ObjectId(),
        dateJoined: new Date(),
      });

      const mockDBSubforum = {
        ...mockSubforum,
        _id: new mongoose.Types.ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        questionCount: 0,
      };


      mockingoose(SubforumModel).toReturn(mockDBSubforum, 'create');

      const result = (await saveSubforum(mockSubforum)) as DatabaseSubforum;

      expect(getUserByUsernameMock).toHaveBeenCalledWith('mod1');
      expect(result._id).toBeDefined();
      expect(result.title).toEqual(mockSubforum.title);
      expect(result.description).toEqual(mockSubforum.description);
      expect(result.moderators).toEqual(mockSubforum.moderators);
      expect(result.tags).toEqual(mockSubforum.tags);
      expect(result.rules).toEqual(mockSubforum.rules);
      expect(result.isActive).toBe(true);
      expect(result.questionCount).toBe(0);
    });

    test('should return error when creator has insufficient karma', async () => {
      const mockSubforum = {
        title: 'Test Subforum',
        description: 'Test Description',
        moderators: ['lowKarmaUser'],
        tags: ['tag1', 'tag2'],
        rules: ['rule1', 'rule2'],
      };

      // Mock user service to return a user with karma 1 (less than required 2)
      getUserByUsernameMock.mockResolvedValueOnce({
        _id: new mongoose.Types.ObjectId(),
        username: 'lowKarmaUser',
        dateJoined: new Date(),
        karma: 1,
      });

      const result = await saveSubforum(mockSubforum);

      expect(getUserByUsernameMock).toHaveBeenCalledWith('lowKarmaUser');
      expect(result).toEqual({ error: 'You need at least 2 karma to create a subforum' });
    });

    test('should return error when creator is not found', async () => {
      const mockSubforum = {
        title: 'Test Subforum',
        description: 'Test Description',
        moderators: ['nonExistentUser'],
        tags: ['tag1', 'tag2'],
        rules: ['rule1', 'rule2'],
      };

      // Mock user service to return error for non-existent user
      getUserByUsernameMock.mockResolvedValueOnce({
        error: 'User not found',
      });

      const result = await saveSubforum(mockSubforum);

      expect(getUserByUsernameMock).toHaveBeenCalledWith('nonExistentUser');
      expect(result).toEqual({ error: 'Error finding creator: User not found' });
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

      expect(getUserByUsernameMock).not.toHaveBeenCalled();
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

      // Mock the user service to return a valid user with karma
      getUserByUsernameMock.mockResolvedValueOnce({
        username: 'mod1',
        karma: 3,
        _id: new mongoose.Types.ObjectId(),
        dateJoined: new Date(),
      });

      // Mock the create operation to throw an error
      jest.spyOn(SubforumModel, 'create').mockRejectedValueOnce(new Error('Database error'));

      const result = await saveSubforum(mockSubforum);


      expect(getUserByUsernameMock).toHaveBeenCalledWith('mod1');
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
      const subforumId = new mongoose.Types.ObjectId();
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
          _id: subforumId.toString(),
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

      // Mock the findOne operation to return the mock subforum
      jest.spyOn(SubforumModel, 'findOne').mockResolvedValueOnce(mockSubforum);

      const result = await getSubforumById(subforumId.toString());

      expect(result).not.toBeNull();
      if (result) {
        expect(JSON.stringify(result._id)).toEqual(JSON.stringify(subforumId.toHexString()));
        expect(result.onlineUsers).toBeDefined();
        expect(result.onlineUsers).toBe(0);
      }
    });

    test('should return null when subforum not found', async () => {
      const subforumId = new mongoose.Types.ObjectId().toString();

      jest.spyOn(SubforumModel, 'findOne').mockResolvedValueOnce(null);

      const result = await getSubforumById(subforumId);

      expect(result).toBeNull();
    });

    test('should return null when database operation fails', async () => {
      const subforumId = new mongoose.Types.ObjectId().toString();

      jest.spyOn(SubforumModel, 'findOne').mockRejectedValueOnce(new Error('Database error'));

      const result = await getSubforumById(subforumId);

      expect(result).toBeNull();
    });
  });

  describe('getAllSubforums', () => {
    test('should successfully retrieve all subforums', async () => {
      const subforum1Id = new mongoose.Types.ObjectId();
      const subforum2Id = new mongoose.Types.ObjectId();

      const mockSubforums: MockSubforumWithToObject[] = [
        {
          _id: subforum1Id,
          title: 'Subforum 1',
          description: 'Description 1',
          moderators: ['mod1'],
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          questionCount: 0,
          tags: [],
          rules: [],
          toObject: (): DatabaseSubforum => ({
            _id: subforum1Id.toString(),
            title: 'Subforum 1',
            description: 'Description 1',
            moderators: ['mod1'],
            createdAt: mockSubforums[0].createdAt,
            updatedAt: mockSubforums[0].updatedAt,
            isActive: true,
            questionCount: 0,
            tags: [],
            rules: [],
          }),
        },
        {
          _id: subforum2Id,
          title: 'Subforum 2',
          description: 'Description 2',
          moderators: ['mod2'],
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          questionCount: 0,
          tags: [],
          rules: [],
          toObject: (): DatabaseSubforum => ({
            _id: subforum2Id.toString(),
            title: 'Subforum 2',
            description: 'Description 2',
            moderators: ['mod2'],
            createdAt: mockSubforums[1].createdAt,
            updatedAt: mockSubforums[1].updatedAt,
            isActive: true,
            questionCount: 0,
            tags: [],
            rules: [],
          }),
        },
      ];

      // Mock the find operation to return the mock subforums
      jest.spyOn(SubforumModel, 'find').mockResolvedValueOnce(mockSubforums);

      const result = await getAllSubforums();

      expect(result.length).toBe(2);
      expect(JSON.stringify(result[0]._id)).toEqual(
        JSON.stringify(mockSubforums[0]._id.toHexString()),
      );
      expect(JSON.stringify(result[1]._id)).toEqual(
        JSON.stringify(mockSubforums[1]._id.toHexString()),
      );
      expect(result[0].title).toBe(mockSubforums[0].title);
      expect(result[1].title).toBe(mockSubforums[1].title);
      expect(result[0].onlineUsers).toBeDefined();
      expect(result[1].onlineUsers).toBeDefined();
      expect(result[0].onlineUsers).toBe(0);
      expect(result[1].onlineUsers).toBe(0);
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
