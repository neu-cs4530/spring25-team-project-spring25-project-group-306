import { Answer, PopulatedDatabaseAnswer, Post, VoteInterface } from '../types/types';
import api from './config';

const ANSWER_API_URL = `${process.env.REACT_APP_SERVER_URL}/answer`;

/**
 * Adds a new answer to a specific question.
 *
 * @param qid - The ID of the question to which the answer is being added.
 * @param ans - The answer object containing the answer details.
 * @throws Error Throws an error if the request fails or the response status is not 200.
 */
const addAnswer = async (qid: string, ans: Answer): Promise<PopulatedDatabaseAnswer> => {
  const data = { qid, ans };

  const res = await api.post(`${ANSWER_API_URL}/addAnswer`, data);
  if (res.status !== 200) {
    throw new Error('Error while creating a new answer');
  }
  return res.data;
};

/**
 * Function to upvote a answer.
 *
 * @param post - The post object containing voting information.
 * @param pid - The id of the post object (PopulatedDatabaseQuestion or PopulatedDatabaseAnswer).
 * @param creatorUsername - The username of the creator of the post.
 * @param username - The username of the person upvoting the answer.
 * @throws Error if there is an issue upvoting the answer.
 */
const upvoteAnswer = async (
  post: Post,
  pid: string,
  creatorUsername: string,
  username: string,
): Promise<VoteInterface> => {
  const data = { post, pid, creatorUsername, username };
  const res = await api.post(`${ANSWER_API_URL}/upvoteAnswer`, data);
  if (res.status !== 200) {
    throw new Error('Error while upvoting the answer');
  }
  return res.data;
};

/**
 * Function to downvote a answer.
 *
 * @param post - The post object containing voting information.
 * @param pid - The id of the post object (PopulatedDatabaseQuestion or PopulatedDatabaseAnswer).
 * @param creatorUsername - The username of the creator of the post.
 * @param username - The username of the person downvoting the answer.
 * @throws Error if there is an issue downvoting the answer.
 */
const downvoteAnswer = async (
  post: Post,
  pid: string,
  creatorUsername: string,
  username: string,
): Promise<VoteInterface> => {
  const data = { post, pid, creatorUsername, username };
  const res = await api.post(`${ANSWER_API_URL}/downvoteAnswer`, data);
  if (res.status !== 200) {
    throw new Error('Error while downvoting the answer');
  }
  return res.data;
};

export { addAnswer, upvoteAnswer, downvoteAnswer };
