import {
  PopulatedDatabaseQuestion,
  Post,
  Question,
  QuestionResponse,
  VoteInterface,
} from '../types/types';
import api from './config';

const QUESTION_API_URL = `${process.env.REACT_APP_SERVER_URL}/question`;

/**
 * Function to get questions by filter.
 *
 * @param order - The order in which to fetch questions. Default is 'newest'.
 * @param search - The search term to filter questions. Default is an empty string.
 * @throws Error if there is an issue fetching or filtering questions.
 */
const getQuestionsByFilter = async (
  order: string = 'newest',
  search: string = '',
): Promise<PopulatedDatabaseQuestion[]> => {
  const res = await api.get(`${QUESTION_API_URL}/getQuestion?order=${order}&search=${search}`);
  if (res.status !== 200) {
    throw new Error('Error when fetching or filtering questions');
  }
  return res.data;
};

/**
 * Function to get a question by its ID.
 *
 * @param qid - The ID of the question to retrieve.
 * @param username - The username of the user requesting the question.
 * @throws Error if there is an issue fetching the question by ID.
 */
const getQuestionById = async (
  qid: string,
  username: string,
): Promise<PopulatedDatabaseQuestion> => {
  const res = await api.get(`${QUESTION_API_URL}/getQuestionById/${qid}?username=${username}`);
  if (res.status !== 200) {
    throw new Error('Error when fetching question by id');
  }
  return res.data;
};

/**
 * Function to add a new question.
 *
 * @param q - The question object to add.
 * @throws Error if there is an issue creating the new question.
 */
const addQuestion = async (q: Question): Promise<PopulatedDatabaseQuestion> => {
  const res = await api.post(`${QUESTION_API_URL}/addQuestion`, q);

  if (res.status !== 200) {
    throw new Error('Error while creating a new question');
  }

  return res.data;
};

/**
 * Function to upvote a question.
 *
 * @param post - The post object containing voting information.
 * @param pid - The id of the post object (PopulatedDatabaseQuestion or PopulatedDatabaseAnswer).
 * @param creatorUsername - The username of the creator of the post.
 * @param postType - If the post is a 'question' or 'answer'.
 * @param username - The username of the person upvoting the question.
 * @throws Error if there is an issue upvoting the question.
 */
const upvoteQuestion = async (
  post: Post,
  pid: string,
  creatorUsername: string,
  username: string,
): Promise<VoteInterface> => {
  const data = { post, pid, creatorUsername, username };
  const res = await api.post(`${QUESTION_API_URL}/upvoteQuestion`, data);
  if (res.status !== 200) {
    throw new Error('Error while upvoting the question');
  }
  return res.data;
};

/**
 * Function to downvote a question.
 *
 * @param post - The post object containing voting information.
 * @param pid - The id of the post object (PopulatedDatabaseQuestion or PopulatedDatabaseAnswer).
 * @param creatorUsername - The username of the creator of the post.
 * @param postType - If the post is a 'question' or 'answer'.
 * @param username - The username of the person downvoting the question.
 * @throws Error if there is an issue downvoting the question.
 */
const downvoteQuestion = async (
  post: Post,
  pid: string,
  creatorUsername: string,
  username: string,
): Promise<VoteInterface> => {
  const data = { post, pid, creatorUsername, username };
  const res = await api.post(`${QUESTION_API_URL}/downvoteQuestion`, data);
  if (res.status !== 200) {
    throw new Error('Error while downvoting the question');
  }
  return res.data;
};

/**
 * Function to pin or unpin a question.
 *
 * @param pid - The id of the question to pin or unpin.
 * @param pin - A boolean indicating whether to pin (true) or unpin (false) the question.
 * @throws Error if there is an issue pinning or unpinning the question.
 */
const pinUnpinQuestion = async (pid: string, pin: boolean): Promise<QuestionResponse> => {
  const data = { pid, pinned: pin };
  const res = await api.post(`${QUESTION_API_URL}/pinUnpinQuestion`, data);
  if (res.status !== 200) {
    throw new Error('Error when fetching or filtering questions');
  }
  return res.data;
};

export {
  getQuestionsByFilter,
  getQuestionById,
  addQuestion,
  upvoteQuestion,
  downvoteQuestion,
  pinUnpinQuestion,
};
