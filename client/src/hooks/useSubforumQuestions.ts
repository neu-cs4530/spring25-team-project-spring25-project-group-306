import { useState, useEffect, useCallback } from 'react';
import { Question } from '../types';
import { pinUnpinQuestion } from '../services/questionService';

/**
 *  Custom hook to fetch and manage questions in a subforum.
 *  It handles loading and error states, and provides functions to pin/unpin questions,
 *  delete questions, and refetch the question list.
 * @param subforumId - The ID of the subforum to fetch questions from.
 * @returns An object containing the pinned and unpinned questions, loading state, error message
 */
const useSubforumQuestions = (subforumId: string | undefined) => {
  const [questionsPinned, setQuestionsPinned] = useState<Question[]>([]);
  const [questionsUnpinned, setQuestionsUnpinned] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Function to pin or unpin a question.
   * @param pid - The ID of the question to pin/unpin.
   * @param pin - Boolean indicating whether to pin (true) or unpin (false) the question.
   */
  const handlePinUnpinQuestion = async (pid: string, pin: boolean) => {
    if (!subforumId) {
      setError('No subforum ID provided');
      return;
    }
    try {
      const response = await pinUnpinQuestion(pid, pin);
      if ('error' in response) {
        setError('Failed to pin/unpin question');
      }
    } catch (err) {
      setError('Error pinning/unpinning question');
    }
  };

  /**
   * Function to fetch questions from the server.
   * It categorizes questions into pinned and unpinned based on their status.
   */
  const fetchQuestions = useCallback(async () => {
    if (!subforumId) {
      setError('No subforum ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/question/getQuestion?subforumId=${subforumId}`,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        },
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to fetch questions: ${errorData}`);
      }

      const data = await response.json();

      const pinnedQuestions = data.filter((question: Question) => question.pinned);
      const unpinnedQuestions = data.filter((question: Question) => !question.pinned);

      setQuestionsPinned(pinnedQuestions);
      setQuestionsUnpinned(unpinnedQuestions);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setQuestionsPinned([]);
      setQuestionsUnpinned([]);
    } finally {
      setLoading(false);
    }
  }, [subforumId]);

  /**
   * Function to delete a question.
   * @param qid - The ID of the question to delete.
   */
  const deleteQuestion = async (qid: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/question/deleteQuestion/${qid}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        },
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to delete question: ${errorData}`);
      }

      await fetchQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return {
    questionsPinned,
    questionsUnpinned,
    loading,
    error,
    handlePinUnpinQuestion,
    refetch: fetchQuestions,
    deleteQuestion,
  };
};

export default useSubforumQuestions;
