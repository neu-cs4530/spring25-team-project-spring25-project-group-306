import { useState, useEffect, useCallback } from 'react';
import { Question } from '../types';

const useSubforumQuestions = (subforumId: string | undefined) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      setQuestions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [subforumId]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return {
    questions,
    loading,
    error,
    refetch: fetchQuestions,
  };
};

export default useSubforumQuestions;
