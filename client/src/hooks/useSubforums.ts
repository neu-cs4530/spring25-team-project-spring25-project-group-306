import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DatabaseSubforum,
  SubforumOnlineUserEvent,
  SubforumWithRuntimeData,
} from '@fake-stack-overflow/shared/types/subforum';
import useUserContext from './useUserContext';

// Interface to represent the Mongoose document structure
interface MongooseDocument<T> {
  _doc?: T;
  onlineUsers?: number;
}

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
  const location = useLocation();
  const { user, socket } = useUserContext();
  const [subforums, setSubforums] = useState<SubforumWithRuntimeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSubforumId, setCurrentSubforumId] = useState<string | null>(null);

  // Extract subforum ID from URL path if present
  useEffect(() => {
    const match = location.pathname.match(/\/subforums\/([^/]+)/);
    const subforumId = match ? match[1] : null;

    // If we're navigating to a different subforum or away from one
    if (currentSubforumId && subforumId !== currentSubforumId && socket) {
      // Leave the previous subforum
      socket.emit('leaveSubforum', currentSubforumId);
    }

    // Update current subforum ID
    setCurrentSubforumId(subforumId);

    // Join the new subforum if present
    if (subforumId && socket) {
      socket.emit('joinSubforum', subforumId);
    }
  }, [location.pathname, socket, currentSubforumId]);

  // Clean up when unmounting
  // eslint-disable-next-line arrow-body-style
  useEffect(() => {
    return () => {
      if (currentSubforumId && socket) {
        socket.emit('leaveSubforum', currentSubforumId);
      }
    };
  }, [currentSubforumId, socket]);

  // Function to update a single subforum's online users count
  const updateSubforumOnlineUsers = (data: SubforumOnlineUserEvent) => {
    setSubforums(currentSubforums =>
      currentSubforums.map(subforum =>
        subforum._id === data.subforumId
          ? { ...subforum, onlineUsers: data.onlineUsers }
          : subforum,
      ),
    );
  };

  // Listen for online users updates
  useEffect(() => {
    if (!socket) {
      return () => {}; // Empty cleanup function
    }

    socket.on('subforumOnlineUsers', updateSubforumOnlineUsers);

    return () => {
      socket.off('subforumOnlineUsers', updateSubforumOnlineUsers);
    };
  }, [socket]);

  /**
   * Function to fetch subforums from the server.
   */
  const fetchSubforums = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/subforums`, {
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
      // Process mongoose document objects
      const subforumsWithOnlineUsers: SubforumWithRuntimeData[] = data.map(
        (sf: MongooseDocument<DatabaseSubforum>) => {
          // Extract the actual document data from _doc if it exists
          const subforum = sf._doc ? sf._doc : (sf as unknown as DatabaseSubforum);
          return {
            ...subforum,
            onlineUsers: sf.onlineUsers || 0,
          };
        },
      );
      setSubforums(subforumsWithOnlineUsers);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setSubforums([]); // Reset subforums on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubforums();
  }, []);

  // Function to navigate to a specific subforum
  const navigateToSubforum = (subforumId: string) => {
    // The join logic is handled in the location effect
    navigate(`/subforums/${subforumId}`);
  };

  // Function to create a new subforum
  const createNewSubforum = () => {
    navigate('/new/subforum');
  };

  // Function to refresh the subforums list
  const refreshSubforums = () => {
    fetchSubforums();
  };

  // Function to check if the user can create a subforum
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
