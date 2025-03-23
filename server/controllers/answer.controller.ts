import express, { Response } from 'express';
import { ObjectId } from 'mongodb';
import {
  Answer,
  AddAnswerRequest,
  FakeSOSocket,
  PopulatedDatabaseAnswer,
  VoteRequest,
} from '../types/types';
import { addAnswerToQuestion, saveAnswer, addVoteToAnswer } from '../services/answer.service';
import { populateDocument } from '../utils/database.util';

const answerController = (socket: FakeSOSocket) => {
  const router = express.Router();

  /**
   * Checks if the provided answer request contains the required fields.
   *
   * @param req The request object containing the answer data.
   *
   * @returns `true` if the request is valid, otherwise `false`.
   */
  function isRequestValid(req: AddAnswerRequest): boolean {
    return !!req.body.qid && !!req.body.ans;
  }

  /**
   * Checks if the provided answer contains the required fields.
   *
   * @param ans The answer object to validate.
   *
   * @returns `true` if the answer is valid, otherwise `false`.
   */
  function isAnswerValid(ans: Answer): boolean {
    return !!ans.text && !!ans.ansBy && !!ans.ansDateTime;
  }

  /**
   * Handles upvoting or downvoting an answer. The request contains an answer ID and the username of the user.
   * If the request is invalid or an error occurs, the appropriate HTTP response status and message are returned.
   *
   * @param req The request object containing the answer ID and username.
   * @param res The HTTP response object used to send back the result of the operation.
   * @param voteType The type of vote to perform ('upvote' or 'downvote').
   *
   * @returns A Promise that resolves to void.
   */
  const handleVote = async (
    req: VoteRequest,
    res: Response,
    voteType: 'upvote' | 'downvote',
  ): Promise<void> => {
    if (!req.body.pid || !req.body.username) {
      res.status(400).send('Invalid request');
      return;
    }

    const { pid, username } = req.body;

    try {
      const status = await addVoteToAnswer(pid, username, voteType);

      if (status && 'error' in status) {
        res.status(500).send(status.error);
        return;
      }

      // Emit the updated vote counts to all connected clients
      socket.emit('voteUpdate', {
        pid,
        upVotes: status.upVotes,
        downVotes: status.downVotes,
      });
      res.json(status);
    } catch (err) {
      res.status(500).send(`Error when ${voteType}ing: ${(err as Error).message}`);
    }
  };
  /**
   * Handles upvoting an answer. The request contains an answer ID and the username of the user
   * If the request is invalid or an error occurs, the appropriate HTTP response status and message are returned.
   *
   * @param req The request object containing the answer ID and username.
   * @param res The HTTP response object used to send back the result of the operation.
   *
   * @returns A Promise that resolves to void.
   */
  const upvoteAnswer = async (req: VoteRequest, res: Response): Promise<void> => {
    handleVote(req, res, 'upvote');
  };

  /**
   * Handles downvoting an answer. The request contains an answer ID and the username of the user
   * If the request is invalid or an error occurs, the appropriate HTTP response status and message are returned.
   *
   * @param req The request object containing the answer ID and username.
   * @param res The HTTP response object used to send back the result of the operation.
   *
   * @returns A Promise that resolves to void.
   */
  const downvoteAnswer = async (req: VoteRequest, res: Response): Promise<void> => {
    handleVote(req, res, 'downvote');
  };

  /**
   * Adds a new answer to a question in the database. The answer request and answer are
   * validated and then saved. If successful, the answer is associated with the corresponding
   * question. If there is an error, the HTTP response's status is updated.
   *
   * @param req The AnswerRequest object containing the question ID and answer data.
   * @param res The HTTP response object used to send back the result of the operation.
   *
   * @returns A Promise that resolves to void.
   */
  const addAnswer = async (req: AddAnswerRequest, res: Response): Promise<void> => {
    if (!isRequestValid(req)) {
      res.status(400).send('Invalid request');
      return;
    }
    if (!isAnswerValid(req.body.ans)) {
      res.status(400).send('Invalid answer');
      return;
    }

    const { qid } = req.body;
    const ansInfo: Answer = req.body.ans;

    try {
      const ansFromDb = await saveAnswer(ansInfo);

      if ('error' in ansFromDb) {
        throw new Error(ansFromDb.error as string);
      }

      const status = await addAnswerToQuestion(qid, ansFromDb);

      if (status && 'error' in status) {
        throw new Error(status.error as string);
      }

      const populatedAns = await populateDocument(ansFromDb._id.toString(), 'answer');

      if (populatedAns && 'error' in populatedAns) {
        throw new Error(populatedAns.error);
      }

      // Populates the fields of the answer that was added and emits the new object
      socket.emit('answerUpdate', {
        qid: new ObjectId(qid),
        answer: populatedAns as PopulatedDatabaseAnswer,
      });
      res.json(ansFromDb);
    } catch (err) {
      res.status(500).send(`Error when adding answer: ${(err as Error).message}`);
    }
  };

  // add appropriate HTTP verbs and their endpoints to the router.
  router.post('/addAnswer', addAnswer);
  router.post('/answerUpvote', upvoteAnswer);
  router.post('/answerDownvote', downvoteAnswer);

  return router;
};

export default answerController;
