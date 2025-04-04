import { useState, useEffect, useCallback } from 'react';
import { Question } from '../types';
import { pinUnpinQuestion } from '../services/questionService';

const useSubforumQuestions = (subforumId: string | undefined) => {
  const [questionsPinned, setQuestionsPinned] = useState<Question[]>([]);
  const [questionsUnpinned, setQuestionsUnpinned] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  };
};

export default useSubforumQuestions;
