import mongoose from 'mongoose';
import supertest from 'supertest';
import { ObjectId } from 'mongodb';
import { app } from '../../app';
import * as answerUtil from '../../services/answer.service';
import * as databaseUtil from '../../utils/database.util';
import { DatabaseAnswer } from '../../types/types';

const saveAnswerSpy = jest.spyOn(answerUtil, 'saveAnswer');
const addAnswerToQuestionSpy = jest.spyOn(answerUtil, 'addAnswerToQuestion');
const popDocSpy = jest.spyOn(databaseUtil, 'populateDocument');
const voteAnswerSpy = jest.spyOn(answerUtil, 'addVoteToAnswer');
const deleteAnswerByIdSpy = jest.spyOn(answerUtil, 'deleteAnswerById');

describe('Answer Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe('POST /addAnswer', () => {
    it('should add a new answer to the question', async () => {
      const validQid = new mongoose.Types.ObjectId();
      const validAid = new mongoose.Types.ObjectId();
      const mockReqBody = {
        qid: validQid,
        ans: {
          text: 'This is a test answer',
          ansBy: 'dummyUserId',
          ansDateTime: new Date('2024-06-03'),
        },
      };

      const mockAnswer = {
        _id: validAid,
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
        comments: [],
        upVotes: [],
        downVotes: [],
      };
      saveAnswerSpy.mockResolvedValueOnce(mockAnswer);

      addAnswerToQuestionSpy.mockResolvedValueOnce({
        _id: validQid,
        title: 'This is a test question',
        text: 'This is a test question',
        tags: [],
        askedBy: 'dummyUserId',
        askDateTime: new Date('2024-06-03'),
        views: [],
        upVotes: [],
        downVotes: [],
        answers: [mockAnswer._id],
        comments: [],
        pinned: false,
      });

      popDocSpy.mockResolvedValueOnce({
        _id: validQid,
        title: 'This is a test question',
        text: 'This is a test question',
        tags: [],
        askedBy: 'dummyUserId',
        askDateTime: new Date('2024-06-03'),
        views: [],
        upVotes: [],
        downVotes: [],
        answers: [mockAnswer],
        comments: [],
        pinned: false,
      });

      const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        _id: validAid.toString(),
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: mockAnswer.ansDateTime.toISOString(),
        comments: [],
        upVotes: [],
        downVotes: [],
      });
    });

    it('should return bad request error if answer text property is missing', async () => {
      const mockReqBody = {
        qid: 'dummyQuestionId',
        ans: {
          ansBy: 'dummyUserId',
          ansDateTime: new Date('2024-06-03'),
        },
      };

      const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

      expect(response.status).toBe(400);
      expect(response.text).toBe('Invalid answer');
    });

    it('should return bad request error if request body has qid property missing', async () => {
      const mockReqBody = {
        ans: {
          ansBy: 'dummyUserId',
          ansDateTime: new Date('2024-06-03'),
        },
      };

      const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

      expect(response.status).toBe(400);
    });

    it('should return bad request error if answer object has ansBy property missing', async () => {
      const mockReqBody = {
        qid: 'dummyQuestionId',
        ans: {
          text: 'This is a test answer',
          ansDateTime: new Date('2024-06-03'),
        },
      };

      const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

      expect(response.status).toBe(400);
    });

    it('should return bad request error if answer object has ansDateTime property missing', async () => {
      const mockReqBody = {
        qid: 'dummyQuestionId',
        ans: {
          text: 'This is a test answer',
          ansBy: 'dummyUserId',
        },
      };

      const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

      expect(response.status).toBe(400);
    });

    it('should return bad request error if request body is missing', async () => {
      const response = await supertest(app).post('/answer/addAnswer');

      expect(response.status).toBe(400);
    });

    it('should return database error in response if saveAnswer method throws an error', async () => {
      const validQid = new mongoose.Types.ObjectId().toString();
      const mockReqBody = {
        qid: validQid,
        ans: {
          text: 'This is a test answer',
          ansBy: 'dummyUserId',
          ansDateTime: new Date('2024-06-03'),
        },
      };

      saveAnswerSpy.mockResolvedValueOnce({ error: 'Error when saving an answer' });

      const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return database error in response if update question method throws an error', async () => {
      const validQid = new mongoose.Types.ObjectId().toString();
      const mockReqBody = {
        qid: validQid,
        ans: {
          text: 'This is a test answer',
          ansBy: 'dummyUserId',
          ansDateTime: new Date('2024-06-03'),
        },
      };

      const mockAnswer = {
        _id: new ObjectId('507f191e810c19729de860ea'),
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
        comments: [],
        upVotes: [],
        downVotes: [],
      };

      saveAnswerSpy.mockResolvedValueOnce(mockAnswer);
      addAnswerToQuestionSpy.mockResolvedValueOnce({ error: 'Error when adding answer to question' });

      const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return database error in response if `populateDocument` method throws an error', async () => {
      const validQid = new mongoose.Types.ObjectId();
      const mockReqBody = {
        qid: validQid,
        ans: {
          text: 'This is a test answer',
          ansBy: 'dummyUserId',
          ansDateTime: new Date('2024-06-03'),
        },
      };

      const mockAnswer = {
        _id: new ObjectId('507f191e810c19729de860ea'),
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-03'),
        comments: [],
        upVotes: [],
        downVotes: [],
      };

      const mockQuestion = {
        _id: validQid,
        title: 'This is a test question',
        text: 'This is a test question',
        tags: [],
        askedBy: 'dummyUserId',
        askDateTime: new Date('2024-06-03'),
        views: [],
        upVotes: [],
        downVotes: [],
        answers: [mockAnswer._id],
        comments: [],
        pinned: false,
      };

      saveAnswerSpy.mockResolvedValueOnce(mockAnswer);
      addAnswerToQuestionSpy.mockResolvedValueOnce(mockQuestion);
      popDocSpy.mockResolvedValueOnce({ error: 'Error when populating document' });

      const response = await supertest(app).post('/answer/addAnswer').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });

  describe('POST /upvoteAnswer', () => {
    it('should upvote an answer', async () => {
      const validPid = new mongoose.Types.ObjectId();
      const mockReqBody = {
        post: {
          upVotes: [],
          downVotes: [],
        },
        pid: validPid.toString(),
        creatorUsername: 'user',
        username: 'test',
      };

      const mockAnswer = {
        msg: 'Answer upvoted successfully',
        upVotes: ['test'],
        downVotes: [],
      };

      voteAnswerSpy.mockResolvedValueOnce({
        msg: 'Answer upvoted successfully',
        upVotes: ['test'],
        downVotes: [],
      });

      const response = await supertest(app).post('/answer/upvoteAnswer').send(mockReqBody);

      expect(response.body).toEqual(mockAnswer);
      expect(response.status).toBe(200);
    });

    it('should return bad request error if request body is missing', async () => {
      const response = await supertest(app).post('/answer/upvoteAnswer');

      expect(response.status).toBe(400);
    });

    it('should return bad request error if addVoteToAnswer errors', async () => {
      const validPid = new mongoose.Types.ObjectId();
      const mockReqBody = {
        post: {
          upVotes: [],
          downVotes: [],
        },
        pid: validPid.toString(),
        creatorUsername: 'user',
        username: 'test',
      };

      voteAnswerSpy.mockResolvedValueOnce({ error: 'Error when adding answer to question' });

      const response = await supertest(app).post('/answer/upvoteAnswer').send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return an internal server error if addVoteToAnswer method throws an error', async () => {
      const validAid = new mongoose.Types.ObjectId().toString();
      const mockReqBody = {
        post: {
          upVotes: [],
          downVotes: [],
        },
        pid: validAid,
        creatorUsername: 'user',
        username: 'test',
      };

      voteAnswerSpy.mockRejectedValueOnce(new Error('Error when upvoting answer'));

      const response = await supertest(app).post('/answer/upvoteAnswer').send(mockReqBody);

      expect(response.status).toBe(500);
    });

    it('should return an internal server error if addVoteToAnswer method returns an error', async () => {
      const validAid = new mongoose.Types.ObjectId().toString();
      const mockReqBody = {
        post: {
          upVotes: [],
          downVotes: [],
        },
        pid: validAid,
        creatorUsername: 'user',
        username: 'test',
      };

      voteAnswerSpy.mockResolvedValueOnce({ error: 'Error when upvoting answer' });

      const response = await supertest(app).post('/answer/upvoteAnswer').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });

  it('should return an internal server error if addVoteToAnswer method throws an error', async () => {
    const validAid = new mongoose.Types.ObjectId().toString();
    const mockReqBody = {
      post: {
        upVotes: [],
        downVotes: [],
      },
      pid: validAid,
      creatorUsername: 'user',
      username: 'test',
    };

    voteAnswerSpy.mockRejectedValueOnce(new Error('Error when upvoting answer'));

    const response = await supertest(app).post('/answer/upvoteAnswer').send(mockReqBody);

    expect(response.status).toBe(500);
  });

  it('should return an internal server error if addVoteToAnswer method returns an error', async () => {
    const validAid = new mongoose.Types.ObjectId().toString();
    const mockReqBody = {
      post: {
        upVotes: [],
        downVotes: [],
      },
      pid: validAid,
      creatorUsername: 'user',
      username: 'test',
    };

    voteAnswerSpy.mockResolvedValueOnce({ error: 'Error when upvoting answer' });

    const response = await supertest(app).post('/answer/upvoteAnswer').send(mockReqBody);

    expect(response.status).toBe(500);
  });

  describe('POST /downvoteAnswer', () => {
    it('should downvote an answer', async () => {
      const validAid = new mongoose.Types.ObjectId();
      const mockReqBody = {
        post: {
          upVotes: [],
          downVotes: [],
        },
        pid: validAid.toString(),
        creatorUsername: 'user',
        username: 'test',
      };

      const mockAnswer = {
        msg: 'Answer downvoted successfully',
        upVotes: [],
        downVotes: ['test'],
      };

      voteAnswerSpy.mockResolvedValueOnce({
        msg: 'Answer downvoted successfully',
        upVotes: [],
        downVotes: ['test'],
      });

      const response = await supertest(app).post('/answer/downvoteAnswer').send(mockReqBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAnswer);
    });

    it('should return bad request error if answer ID is missing', async () => {
      const mockReqBody = {
        username: 'test',
      };

      const response = await supertest(app).post('/answer/downvoteAnswer').send(mockReqBody);

      expect(response.status).toBe(400);
    });

    it('should return bad request error if request body is missing', async () => {
      const response = await supertest(app).post('/answer/downvoteAnswer');

      expect(response.status).toBe(400);
    });

    it('should return bad request error if addVoteToAnswer errors', async () => {
      const validPid = new mongoose.Types.ObjectId();
      const mockReqBody = {
        post: {
          upVotes: [],
          downVotes: [],
        },
        pid: validPid.toString(),
        creatorUsername: 'user',
        username: 'test',
      };

      voteAnswerSpy.mockResolvedValueOnce({ error: 'Error when adding answer to question' });

      const response = await supertest(app).post('/answer/downvoteAnswer').send(mockReqBody);

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /deleteAnswer/:aid', () => {
    const deleteAnswerSpy = jest.spyOn(answerUtil, 'deleteAnswerById');

    const validAidDelete = new mongoose.Types.ObjectId();

    const mockAnswer = {
      _id: validAidDelete,
      text: 'This is a test answer',
      ansBy: 'dummyUserId',
      ansDateTime: new Date('2024-06-03'),
      comments: [],
      upVotes: [],
      downVotes: [],
    };

    it('should delete an answer and return the updated answer list', async () => {
      deleteAnswerSpy.mockResolvedValueOnce(mockAnswer);
      popDocSpy.mockResolvedValueOnce(mockAnswer);

      const response = await supertest(app).delete(`/answer/deleteAnswer/${validAidDelete}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        ...mockAnswer,
        ansDateTime: mockAnswer.ansDateTime.toISOString(),
        _id: validAidDelete.toString(),
      });
    });

    it('should return server error if answer ID is missing', async () => {
      const response = await supertest(app).delete('/answer/deleteAnswer/');

      expect(response.status).toBe(404); // Express returns 404 for missing route parameters
    });

    it('should return bad request error if answer ID is invalid', async () => {
      const invalidAid = 'invalidObjectId';

      const response = await supertest(app).delete(`/answer/deleteAnswer/${invalidAid}`);

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error when deleting answer');
    });

    it('should return database error in response if deleteAnswerById method throws an error', async () => {
      const validAid = new mongoose.Types.ObjectId().toString();

      deleteAnswerSpy.mockResolvedValueOnce({ error: 'Error when deleting answer' });

      const response = await supertest(app).delete(`/answer/deleteAnswer/${validAid}`);

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error when deleting answer');
    });

    it('should return database error in response if populateDocument method throws an error', async () => {
      const validAid = new mongoose.Types.ObjectId().toString();

      deleteAnswerSpy.mockResolvedValueOnce(mockAnswer);
      popDocSpy.mockResolvedValueOnce({ error: 'Error when populating document' });

      const response = await supertest(app).delete(`/answer/deleteAnswer/${validAid}`);

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error when deleting answer');
    });

    it('should return a 400 error if aid is null', async () => {
      const nullAid = undefined;
      const response = await supertest(app).delete(`/answer/deleteAnswer/${nullAid}`);

      expect(response.status).toBe(500);
      expect(response.text).toBe('Error when deleting answer');
    });
  });
});
