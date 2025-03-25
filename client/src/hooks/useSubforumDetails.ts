import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DatabaseSubforum } from '@fake-stack-overflow/shared/types/subforum';
import useUserContext from './useUserContext';

const useSubforumDetails = (subforumId: string | undefined) => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [subforum, setSubforum] = useState<DatabaseSubforum | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubforum = async () => {
      if (!subforumId) {
        setError('No subforum ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/subforums/${subforumId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Failed to fetch subforum: ${errorData}`);
        }

        const data = await response.json();
        setSubforum(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching subforum:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        setSubforum(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubforum();
  }, [subforumId]);

  const isModerator = !!user && !!subforum?.moderators.includes(user.username);

  const navigateToSettings = () => {
    if (subforumId) {
      navigate(`/subforums/${subforumId}/settings`);
    }
  };

  return {
    subforum,
    loading,
    error,
    isModerator,
    navigateToSettings,
  };
};

export default useSubforumDetails;
