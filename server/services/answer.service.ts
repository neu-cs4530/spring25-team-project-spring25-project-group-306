import { QueryOptions } from 'mongoose';
import { VoteResponse } from '../../shared/types/post';
import {
  Answer,
  AnswerResponse,
  DatabaseAnswer,
  DatabaseQuestion,
  PopulatedDatabaseAnswer,
  PopulatedDatabaseQuestion,
  QuestionResponse,
} from '../types/types';
import AnswerModel from '../models/answers.model';
import QuestionModel from '../models/questions.model';
import { updateVoteOperation } from '../utils/database.util';

/**
 * Records the most recent answer time for a given question based on its answers.
 *
 * @param {PopulatedDatabaseQuestion} question - The question containing answers to check.
 * @param {Map<string, Date>} mp - A map storing the most recent answer time for each question.
 */
export const getMostRecentAnswerTime = (
  question: PopulatedDatabaseQuestion,
  mp: Map<string, Date>,
): void => {
  question.answers.forEach((answer: PopulatedDatabaseAnswer) => {
    const currentMostRecent = mp.get(question._id.toString());
    if (!currentMostRecent || currentMostRecent < answer.ansDateTime) {
      mp.set(question._id.toString(), answer.ansDateTime);
    }
  });
};

/**
 * Saves a new answer to the database.
 *
 * @param {Answer} answer - The answer object to be saved.
 * @returns {Promise<AnswerResponse>} - A promise resolving to the saved answer or an error message.
 */
export const saveAnswer = async (answer: Answer): Promise<AnswerResponse> => {
  try {
    const result: DatabaseAnswer = await AnswerModel.create(answer);
    return result;
  } catch (error) {
    return { error: 'Error when saving an answer' };
  }
};

/**
 * Adds vote to answer.
 * @param {string} pid - The answer ID
 * @param {string} username - The username who voted
 * @param {'upvote' | 'downvote'} voteType - The vote type
 * @returns {Promise<VoteResponse>} - The updated vote result
 */
export const addVoteToAnswer = async (
  pid: string,
  username: string,
  voteType: 'upvote' | 'downvote',
): Promise<VoteResponse> => {
  const updateOperation: QueryOptions = updateVoteOperation(username, voteType);

  try {
    const result: DatabaseAnswer | null = await AnswerModel.findOneAndUpdate(
      { _id: pid },
      updateOperation,
      { new: true },
    );

    if (result === null) {
      throw new Error('');
    }

    let msg = '';

    if (voteType === 'upvote') {
      msg = result.upVotes.includes(username)
        ? 'Answer upvoted successfully'
        : 'Upvote cancelled successfully';
    } else {
      msg = result.downVotes.includes(username)
        ? 'Answer downvoted successfully'
        : 'Downvote cancelled successfully';
    }
    return { msg, upVotes: result.upVotes || [], downVotes: result.downVotes || [] };
  } catch (error) {
    return {
      error:
        voteType === 'upvote'
          ? `Error when adding upvote to answer`
          : `Error when adding downvote to answer`,
    };
  }
};

/**
 * Adds an existing answer to a specified question in the database.
 *
 * @param {string} qid - The ID of the question to which the answer will be added.
 * @param {DatabaseAnswer} ans - The answer to associate with the question.
 * @returns {Promise<QuestionResponse>} - A promise resolving to the updated question or an error message.
 */
export const addAnswerToQuestion = async (
  qid: string,
  ans: DatabaseAnswer,
): Promise<QuestionResponse> => {
  try {
    if (!ans || !ans.text || !ans.ansBy || !ans.ansDateTime) {
      throw new Error('Invalid answer');
    }

    const result: DatabaseQuestion | null = await QuestionModel.findOneAndUpdate(
      { _id: qid },
      { $push: { answers: { $each: [ans._id], $position: 0 } } },
      { new: true },
    );

    if (result === null) {
      throw new Error('Error when adding answer to question');
    }
    return result;
  } catch (error) {
    return { error: 'Error when adding answer to question' };
  }
};
