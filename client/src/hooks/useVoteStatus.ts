import { useEffect, useState } from 'react';
import useUserContext from './useUserContext';
import { Post } from '../types/types';

/**
 * Custom hook to handle voting logic for a post.
 * It manages the current vote count, user vote status (upvoted, downvoted),
 * and handles real-time vote updates via socket events.
 *
 * @param post - The post object for which the voting is tracked.
 *
 * @returns count - The urrent vote count (upVotes - downVotes)
 * @returns setCount - The function to manually update vote count
 * @returns voted - The user's vote status
 * @returns setVoted - The function to manually update user's vote status
 */

const useVoteStatus = ({ post }: { post: Post }) => {
  const { user, socket } = useUserContext();
  const [count, setCount] = useState<number>(0);
  const [voted, setVoted] = useState<number>(0);

  useEffect(() => {
    /**
     * Function to get the current vote value for the user.
     *
     * @returns The current vote value for the user in the question, 1 for upvote, -1 for downvote, 0 for no vote.
     */
    const getVoteValue = () => {
      if (user.username && post?.upVotes?.includes(user.username)) {
        return 1;
      }
      if (user.username && post?.downVotes?.includes(user.username)) {
        return -1;
      }
      return 0;
    };

    // Set the initial count and vote value
    setCount((post.upVotes || []).length - (post.downVotes || []).length);
    setVoted(getVoteValue());
  }, [post, user.username, socket]);

  return {
    count,
    setCount,
    voted,
    setVoted,
  };
};

export default useVoteStatus;
