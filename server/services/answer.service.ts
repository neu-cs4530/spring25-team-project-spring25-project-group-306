import { QueryOptions } from 'mongoose';
import {
  Answer,
  AnswerResponse,
  DatabaseAnswer,
  DatabaseQuestion,
  PopulatedDatabaseAnswer,
  PopulatedDatabaseQuestion,
  Post,
  QuestionResponse,
  VoteResponse,
} from '../types/types';
import AnswerModel from '../models/answers.model';
import QuestionModel from '../models/questions.model';
import { updateUserKarma } from './user.service';

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
 * @param {Post} post - The post
 * @param {string} pid - The id of the post object
 * @param {string} creatorUsername - The username of the creator of the post
 * @param {string} username - The username who voted
 * @param {'upvote' | 'downvote'} voteType - The vote type
 * @returns {Promise<VoteResponse>} - The updated vote result
 */
export const addVoteToAnswer = async (
  post: Post,
  pid: string,
  creatorUsername: string,
  username: string,
  voteType: 'upvote' | 'downvote',
): Promise<VoteResponse> => {
  let updateOperation: QueryOptions;

  if (voteType === 'upvote') {
    updateOperation = [
      {
        $set: {
          upVotes: {
            $cond: [
              { $in: [username, '$upVotes'] },
              { $filter: { input: '$upVotes', as: 'u', cond: { $ne: ['$$u', username] } } },
              { $concatArrays: ['$upVotes', [username]] },
            ],
          },
          downVotes: {
            $cond: [
              { $in: [username, '$upVotes'] },
              '$downVotes',
              { $filter: { input: '$downVotes', as: 'd', cond: { $ne: ['$$d', username] } } },
            ],
          },
        },
      },
    ];
  } else {
    updateOperation = [
      {
        $set: {
          downVotes: {
            $cond: [
              { $in: [username, '$downVotes'] },
              { $filter: { input: '$downVotes', as: 'd', cond: { $ne: ['$$d', username] } } },
              { $concatArrays: ['$downVotes', [username]] },
            ],
          },
          upVotes: {
            $cond: [
              { $in: [username, '$downVotes'] },
              '$upVotes',
              { $filter: { input: '$upVotes', as: 'u', cond: { $ne: ['$$u', username] } } },
            ],
          },
        },
      },
    ];
  }

  try {
    const result: DatabaseAnswer | null = await AnswerModel.findOneAndUpdate(
      { _id: pid },
      updateOperation,
      { new: true },
    );

    if (!result) {
      return { error: 'Answer not found!' };
    }

    let msg = '';
    let karmaChange = 0;
    const alreadyUpvoted = post.upVotes.includes(username);
    const alreadyDownvoted = post.downVotes.includes(username);

    if (voteType === 'upvote') {
      if (alreadyDownvoted) {
        msg = 'Question upvoted successfully';
        karmaChange = 2;
      } else if (!alreadyUpvoted) {
        msg = 'Question upvoted successfully';
        karmaChange = 1;
      } else {
        msg = 'Upvote cancelled successfully';
        karmaChange = -1;
      }
    } else if (alreadyUpvoted) {
      msg = 'Question downvoted successfully';
      karmaChange = -2;
    } else if (!alreadyDownvoted) {
      msg = 'Question downvoted successfully';
      karmaChange = -1;
    } else {
      msg = 'Downvote cancelled successfully';
      karmaChange = 1;
    }

    if (karmaChange !== 0) {
      await updateUserKarma(creatorUsername, karmaChange);
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
