import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DatabaseSubforum } from '@fake-stack-overflow/shared/types/subforum';
import useUserContext from './useUserContext';

/**
 * Custom hook to handle subforum data fetching and state management
 *
 * @returns subforums - Array of subforums
 * @returns loading - Loading state
 * @returns error - Error message if any
 * @returns navigateToSubforum - Function to navigate to a specific subforum
 * @returns createNewSubforum - Function to navigate to subforum creation page
 * @returns refreshSubforums - Function to refresh the subforums list
 */
const useSubforums = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [subforums, setSubforums] = useState<DatabaseSubforum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubforums = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/subforums', {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `Failed to fetch subforums: ${response.status} ${response.statusText}\n${errorData}`,
        );
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server did not return JSON data');
      }

      const data = await response.json();
      setSubforums(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching subforums:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSubforums([]); // Reset subforums on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubforums();
  }, []);

  const navigateToSubforum = (subforumId: string) => {
    navigate(`/subforums/${subforumId}`);
  };

  const createNewSubforum = () => {
    navigate('/new/subforum');
  };

  const refreshSubforums = () => {
    fetchSubforums();
  };

  const canCreateSubforum = () => !!user;

  return {
    subforums,
    loading,
    error,
    navigateToSubforum,
    createNewSubforum,
    refreshSubforums,
    canCreateSubforum,
    user,
  };
};

export default useSubforums;
