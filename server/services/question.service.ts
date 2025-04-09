import { ObjectId } from 'mongodb';
import { QueryOptions } from 'mongoose';
import {
  DatabaseComment,
  DatabaseQuestion,
  DatabaseTag,
  OrderType,
  PopulatedDatabaseAnswer,
  PopulatedDatabaseQuestion,
  Post,
  Question,
  QuestionResponse,
  VoteResponse,
} from '../types/types';
import AnswerModel from '../models/answers.model';
import QuestionModel from '../models/questions.model';
import TagModel from '../models/tags.model';
import CommentModel from '../models/comments.model';
import { parseKeyword, parseTags } from '../utils/parse.util';
import { checkTagInQuestion } from './tag.service';
import {
  sortQuestionsByActive,
  sortQuestionsByMostViews,
  sortQuestionsByNewest,
  sortQuestionsByUnanswered,
} from '../utils/sort.util';
import { updateUserKarma } from './user.service';

/**
 * Checks if keywords exist in a question's title or text.
 * @param {Question} q - The question to check
 * @param {string[]} keywordlist - The keywords to check
 * @returns {boolean} - `true` if any keyword is found
 */
const checkKeywordInQuestion = (q: Question, keywordlist: string[]): boolean => {
  for (const w of keywordlist) {
    if (q.title.includes(w) || q.text.includes(w)) {
      return true;
    }
  }
  return false;
};

/**
 * Retrieves questions ordered by specified criteria.
 * @param {OrderType} order - The order type to filter the questions
 * @returns {Promise<Question[]>} - The ordered list of questions
 */
export const getQuestionsByOrder = async (
  order: OrderType,
): Promise<PopulatedDatabaseQuestion[]> => {
  try {
    const qlist: PopulatedDatabaseQuestion[] = await QuestionModel.find().populate<{
      tags: DatabaseTag[];
      answers: PopulatedDatabaseAnswer[];
      comments: DatabaseComment[];
    }>([
      { path: 'tags', model: TagModel },
      { path: 'answers', model: AnswerModel, populate: { path: 'comments', model: CommentModel } },
      { path: 'comments', model: CommentModel },
    ]);

    switch (order) {
      case 'active':
        return sortQuestionsByActive(qlist);
      case 'unanswered':
        return sortQuestionsByUnanswered(qlist);
      case 'newest':
        return sortQuestionsByNewest(qlist);
      case 'mostViewed':
      default:
        return sortQuestionsByMostViews(qlist);
    }
  } catch (error) {
    return [];
  }
};

/**
 * Filters questions by the user who asked them.
 * @param {PopulatedDatabaseQuestion[]} qlist - The list of questions
 * @param {string} askedBy - The username to filter by
 * @returns {PopulatedDatabaseQuestion[]} - Filtered questions
 */
export const filterQuestionsByAskedBy = (
  qlist: PopulatedDatabaseQuestion[],
  askedBy: string,
): PopulatedDatabaseQuestion[] => qlist.filter(q => q.askedBy === askedBy);

/**
 * Filters questions by search string containing tags and/or keywords.
 * @param {PopulatedDatabaseQuestion[]} qlist - The list of questions
 * @param {string} search - The search string
 * @returns {PopulatedDatabaseQuestion[]} - Filtered list of questions
 */
export const filterQuestionsBySearch = (
  qlist: PopulatedDatabaseQuestion[],
  search: string | undefined,
): PopulatedDatabaseQuestion[] => {
  if (!search) {
    return qlist;
  }

  const searchTags = parseTags(search);
  const searchKeyword = parseKeyword(search);

  return qlist.filter((q: Question) => {
    if (searchKeyword.length === 0 && searchTags.length === 0) {
      return true;
    }

    if (searchKeyword.length === 0) {
      return checkTagInQuestion(q, searchTags);
    }

    if (searchTags.length === 0) {
      return checkKeywordInQuestion(q, searchKeyword);
    }

    return checkKeywordInQuestion(q, searchKeyword) || checkTagInQuestion(q, searchTags);
  });
};

/**
 * Fetches a question by ID and increments its view count.
 * @param {string} qid - The question id
 * @param {string} username - The username requesting the question
 * @returns {Promise<QuestionResponse | null>} - The question with incremented views or error message
 */
export const fetchAndIncrementQuestionViewsById = async (
  qid: string,
  username: string,
): Promise<PopulatedDatabaseQuestion | { error: string }> => {
  try {
    const q: PopulatedDatabaseQuestion | null = await QuestionModel.findOneAndUpdate(
      { _id: new ObjectId(qid) },
      { $addToSet: { views: username } },
      { new: true },
    ).populate<{
      tags: DatabaseTag[];
      answers: PopulatedDatabaseAnswer[];
      comments: DatabaseComment[];
    }>([
      { path: 'tags', model: TagModel },
      { path: 'answers', model: AnswerModel, populate: { path: 'comments', model: CommentModel } },
      { path: 'comments', model: CommentModel },
    ]);

    if (!q) {
      throw new Error('Question not found');
    }

    return q;
  } catch (error) {
    return { error: 'Error when fetching and updating a question' };
  }
};

/**
 * Saves a new question to the database.
 * @param {Question} question - The question to save
 * @returns {Promise<QuestionResponse>} - The saved question or error message
 */
export const saveQuestion = async (question: Question): Promise<QuestionResponse> => {
  try {
    const result: DatabaseQuestion = await QuestionModel.create(question);

    return result;
  } catch (error) {
    return { error: 'Error when saving a question' };
  }
};

/**
 * Deletes a question from the database.
 * @param {Question} qid - The question id to delete
 * @returns {Promise<QuestionResponse>} - The deleted question or error message
 */
export const deleteQuestionById = async (qid: string): Promise<QuestionResponse> => {
  try {
    const result: DatabaseQuestion | null = await QuestionModel.findByIdAndDelete(qid).lean();

    if (!result) {
      return { error: 'Question not found!' };
    }

    return result;
  } catch (error) {
    return { error: `Error when deleting a question : ${error}` };
  }
};

/**
 * Adds a vote to a question.
 * @param {Post} post - The post
 * @param {string} pid - The id of the post object
 * @param {string} creatorUsername - The username of the creator of the post
 * @param {string} username - The username who voted
 * @param {'upvote' | 'downvote'} voteType - The vote type
 * @returns {Promise<VoteResponse>} - The updated vote result
 */
export const addVoteToQuestion = async (
  post: Post,
  pid: string,
  creatorUsername: string,
  username: string,
  voteType: 'upvote' | 'downvote',
): Promise<VoteResponse> => {
  // Define the update operation based on the vote type (upvote or downvote)
  let updateOperation: QueryOptions;

  if (voteType === 'upvote') {
    // Handle the upvote logic: add/remove the username from upVotes and adjust downVotes accordingly
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
    // Handle the downvote logic: add/remove the username from downVotes and adjust upVotes accordingly
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
    // Update the question document in the database with the new vote operation
    const result: DatabaseQuestion | null = await QuestionModel.findOneAndUpdate(
      { _id: pid },
      updateOperation,
      { new: true },
    );

    // If the question is not found, return an error
    if (!result) {
      return { error: 'Question not found!' };
    }

    // Initialize variables for the response message and karma change
    let msg = '';
    let karmaChange = 0;

    // Check if the user has already upvoted or downvoted the post
    const alreadyUpvoted = post.upVotes.includes(username);
    const alreadyDownvoted = post.downVotes.includes(username);

    // Determine the message and karma change based on the vote type and current state
    if (voteType === 'upvote') {
      if (alreadyDownvoted) {
        msg = 'Question upvoted successfully';
        karmaChange = 2; // Switching from downvote to upvote
      } else if (!alreadyUpvoted) {
        msg = 'Question upvoted successfully';
        karmaChange = 1; // Adding a new upvote
      } else {
        msg = 'Upvote cancelled successfully';
        karmaChange = -1; // Removing an existing upvote
      }
    } else if (alreadyUpvoted) {
      msg = 'Question downvoted successfully';
      karmaChange = -2; // Switching from upvote to downvote
    } else if (!alreadyDownvoted) {
      msg = 'Question downvoted successfully';
      karmaChange = -1; // Adding a new downvote
    } else {
      msg = 'Downvote cancelled successfully';
      karmaChange = 1; // Removing an existing downvote
    }

    // Update the creator's karma if there is a change
    if (karmaChange !== 0) {
      await updateUserKarma(creatorUsername, karmaChange);
    }

    // Return the updated vote result and message
    return {
      msg,
      upVotes: result.upVotes || [],
      downVotes: result.downVotes || [],
    };
  } catch (err) {
    // Handle any errors that occur during the update operation
    return {
      error:
        voteType === 'upvote'
          ? 'Error when adding upvote to question'
          : 'Error when adding downvote to question',
    };
  }
};

/**
 * Updates the pin status of a question.
 * @param {string} pid - The ID of the question to update.
 * @param {boolean} pinned - The new pin status to set for the question.
 * @returns {Promise<QuestionResponse>} - The updated question or an error message if the operation fails.
 */
export const updateQuestionPin = async (
  pid: string,
  pinned: boolean,
): Promise<QuestionResponse> => {
  try {
    const updatedQuestion = await QuestionModel.findOneAndUpdate(
      { _id: pid },
      { $set: { pinned: Boolean(pinned) } },
      { new: true, runValidators: true },
    );

    if (!updatedQuestion) {
      return { error: 'Question not found!' };
    }

    return updatedQuestion;
  } catch (error) {
    return { error: 'Error when updating question pin status' };
  }
};
