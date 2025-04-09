import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SubforumOnlineUserEvent,
  SubforumWithRuntimeData,
} from '@fake-stack-overflow/shared/types/subforum';
import useUserContext from './useUserContext';

/**
 *  Custom hook to fetch and manage subforum details.
 *  It handles loading and error states, and provides a function to navigate to subforum settings.
 *  It also listens for online users updates via a WebSocket connection.
 *  The hook returns the subforum data, loading state, error message, and a function to refetch the data.
 *  It also provides a boolean indicating if the current user is a moderator of the subforum.
 *  @param subforumId - The ID of the subforum to fetch.
 *  @returns An object containing the subforum data, loading state, error message, isModerator flag,
 *           navigateToSettings function, and refetch function.
 */
const useSubforumDetails = (subforumId: string | undefined) => {
  const navigate = useNavigate();
  const { user, socket } = useUserContext();
  const [subforum, setSubforum] = useState<SubforumWithRuntimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for online users updates
  useEffect(() => {
    if (!socket || !subforumId) {
      // Early return with a function to satisfy consistent-return
      return function cleanup() {};
    }

    const handleOnlineUsersUpdate = (data: SubforumOnlineUserEvent) => {
      if (data.subforumId === subforumId) {
        setSubforum(current => (current ? { ...current, onlineUsers: data.onlineUsers } : null));
      }
    };

    socket.on('subforumOnlineUsers', handleOnlineUsersUpdate);

    // Join this subforum to track online users
    socket.emit('joinSubforum', subforumId);

    return function cleanup() {
      socket.off('subforumOnlineUsers', handleOnlineUsersUpdate);
      socket.emit('leaveSubforum', subforumId);
    };
  }, [socket, subforumId]);

  const fetchSubforum = useCallback(async () => {
    if (!subforumId) {
      setError('No subforum ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/subforums/${subforumId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to fetch subforum: ${errorData}`);
      }

      const rawData = await response.json();

      // Extract data from Mongoose document if needed
      const subforumData = rawData._doc ? rawData._doc : rawData;

      if (!subforumData || typeof subforumData !== 'object' || !subforumData._id) {
        throw new Error('Invalid subforum data received');
      }

      // Create a properly typed subforum object
      const processedSubforum: SubforumWithRuntimeData = {
        _id: subforumData._id,
        title: subforumData.title || '',
        description: subforumData.description || '',
        moderators: Array.isArray(subforumData.moderators) ? subforumData.moderators : [],
        createdAt: subforumData.createdAt ? new Date(subforumData.createdAt) : new Date(),
        updatedAt: subforumData.updatedAt ? new Date(subforumData.updatedAt) : new Date(),
        questionCount: subforumData.questionCount || 0,
        tags: Array.isArray(subforumData.tags) ? subforumData.tags : [],
        rules: Array.isArray(subforumData.rules) ? subforumData.rules : [],
        isActive: subforumData.isActive !== false,
        onlineUsers: rawData.onlineUsers || 0,
        public: subforumData.public || true,
        members: Array.isArray(subforumData.members) ? subforumData.members : [],
      };

      setSubforum(processedSubforum);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSubforum(null);
    } finally {
      setLoading(false);
    }
  }, [subforumId]);

  useEffect(() => {
    fetchSubforum();
  }, [fetchSubforum]);

  // Add null checking to prevent the "Cannot read properties of undefined (reading 'includes')" error
  const isModerator =
    !!user &&
    !!subforum &&
    Array.isArray(subforum.moderators) &&
    subforum.moderators.includes(user.username);

  /**
   * Navigate to the subforum settings page.
   * This function is called when the user clicks on the settings button.
   * It checks if the subforumId is available and then navigates to the settings page.
   * @returns {void}
   */
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
    refetch: fetchSubforum,
  };
};

export default useSubforumDetails;
