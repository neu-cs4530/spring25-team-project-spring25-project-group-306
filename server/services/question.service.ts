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
    const result: DatabaseQuestion | null = await QuestionModel.findOneAndUpdate(
      { _id: pid },
      updateOperation,
      { new: true },
    );

    if (!result) {
      return { error: 'Question not found!' };
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

    return {
      msg,
      upVotes: result.upVotes || [],
      downVotes: result.downVotes || [],
    };
  } catch (err) {
    return {
      error:
        voteType === 'upvote'
          ? 'Error when adding upvote to question'
          : 'Error when adding downvote to question',
    };
  }
};
