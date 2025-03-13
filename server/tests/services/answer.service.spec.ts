import mongoose from 'mongoose';
import AnswerModel from '../../models/answers.model';
import QuestionModel from '../../models/questions.model';
import { saveAnswer, addAnswerToQuestion, addVoteToAnswer } from '../../services/answer.service';
import { DatabaseAnswer, DatabaseQuestion } from '../../types/types';
import { QUESTIONS, ans1, ans4 } from '../mockData.models';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('Answer model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('saveAnswer', () => {
    test('saveAnswer should return the saved answer', async () => {
      const mockAnswer = {
        text: 'This is a test answer',
        ansBy: 'dummyUserId',
        ansDateTime: new Date('2024-06-06'),
        comments: [],
        upVotes: [],
        downVotes: [],
      };
      const mockDBAnswer = {
        ...mockAnswer,
        _id: new mongoose.Types.ObjectId(),
      };

      mockingoose(AnswerModel, 'create').toReturn(mockDBAnswer);

      const result = (await saveAnswer(mockAnswer)) as DatabaseAnswer;

      expect(result._id).toBeDefined();
      expect(result.text).toEqual(mockAnswer.text);
      expect(result.ansBy).toEqual(mockAnswer.ansBy);
      expect(result.ansDateTime).toEqual(mockAnswer.ansDateTime);
    });
  });

  describe('addAnswerToQuestion', () => {
    test('addAnswerToQuestion should return the updated question', async () => {
      const question: DatabaseQuestion = QUESTIONS.filter(
        q => q._id && q._id.toString() === '65e9b5a995b6c7045a30d823',
      )[0];

      jest
        .spyOn(QuestionModel, 'findOneAndUpdate')
        .mockResolvedValueOnce({ ...question, answers: [...question.answers, ans4._id] });

      const result = (await addAnswerToQuestion(
        '65e9b5a995b6c7045a30d823',
        ans4,
      )) as DatabaseQuestion;

      expect(result.answers.length).toEqual(4);
      expect(result.answers).toContain(ans4._id);
    });

    test('addAnswerToQuestion should return an object with error if findOneAndUpdate throws an error', async () => {
      mockingoose(QuestionModel).toReturn(new Error('error'), 'findOneAndUpdate');

      const result = await addAnswerToQuestion('65e9b5a995b6c7045a30d823', ans1);

      expect(result).toHaveProperty('error');
    });

    test('addAnswerToQuestion should return an object with error if findOneAndUpdate returns null', async () => {
      mockingoose(QuestionModel).toReturn(null, 'findOneAndUpdate');

      const result = await addAnswerToQuestion('65e9b5a995b6c7045a30d823', ans1);

      expect(result).toHaveProperty('error');
    });

    test('addAnswerToQuestion should throw an error if a required field is missing in the answer', async () => {
      const invalidAnswer: Partial<DatabaseAnswer> = {
        text: 'This is an answer text',
        ansBy: 'user123', // Missing ansDateTime
      };

      const qid = 'validQuestionId';

      expect(addAnswerToQuestion(qid, invalidAnswer as DatabaseAnswer)).resolves.toEqual({
        error: 'Error when adding answer to question',
      });
    });
  });
  describe('addVoteToAnswer', () => {
    test('addVoteToAnswer should return expected message and updated votes', async () => {
      const username = 'testUser';
      const aid = 'testID';
      const voteType = 'upVote';

      const mockAnswer = {
        _id: aid,
        upVotes: [],
        downVotes: [],
      };

      const updatedAnswer = {
        ...mockAnswer,
        upVotes: [username],
        downVotes: [],
      };

      mockingoose(AnswerModel).toReturn(updatedAnswer, 'findOneAndUpdate');

      const result = await addVoteToAnswer(aid, username, voteType);

      expect(result).toEqual({
        msg: 'Answer upvoted successfully',
        upVotes: ['testUser'],
        downVotes: [],
      });
    });

    test('addVoteToAnswer should return an object with error if findOneAndUpdate throws an error', async () => {
      const username = 'testUser';
      const aid = 'testID';
      const voteType = 'upVote';

      mockingoose(AnswerModel).toReturn(new Error('error'), 'findOneAndUpdate');

      const result = await addVoteToAnswer(aid, username, voteType);

      expect(result).toHaveProperty('error');
    });

    test('addVoteToAnswer should return an object with error if findOneAndUpdate returns null', async () => {
      const username = 'testUser';
      const aid = 'testID';
      const voteType = 'upVote';

      mockingoose(AnswerModel).toReturn(null, 'findOneAndUpdate');

      const result = await addVoteToAnswer(aid, username, voteType);

      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toEqual('Error when adding upvote to answer');
      }
    });

    test('addVoteToAnswer should return an object with error if findOneAndUpdate returns null', async () => {
      const username = 'testUser';
      const aid = 'testID';
      const voteType = 'downVote';

      mockingoose(AnswerModel).toReturn(null, 'findOneAndUpdate');

      const result = await addVoteToAnswer(aid, username, voteType);

      expect(result).toHaveProperty('error');
      if ('error' in result) {
        expect(result.error).toEqual('Error when adding downvote to answer');
      }
    });
  });
});
