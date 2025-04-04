import { Request } from 'express';

/**
 * Represents a question or an answer, and includes their shared functionality: upvotes and downvotes.
 * - `upVotes`: An array of usernames who have upvoted the post.
 * - `downVotes`: An array of usernames who have downvoted the post.
 */
export interface Post {
  upVotes: string[];
  downVotes: string[];
}

/**
 * Interface extending the request body for voting on a post.
 * - `pid`: The unique identifier of the post being voted on.
 * - `username`: The username of the user casting the vote.
 */
export interface VoteRequest extends Request {
  body: {
    post: Post;
    pid: string;
    creatorUsername: string;
    username: string;
  };
}

export interface PinUnpinRequest extends Request {
  body: {
    pid: string;
    pinned: boolean;
  };
}

/**
 * Type representing an object with the vote success message, updated upVotes, updated downVotes
 */
export type VoteInterface = {
  msg: string;
  upVotes: string[];
  downVotes: string[];
};

/**
 * Type representing possible responses for a vote-related operation.
 * - Either an object with the vote success message, updated upVotes,
 *   and updated downVotes, or an error message.
 */
export type VoteResponse = VoteInterface | { error: string };
