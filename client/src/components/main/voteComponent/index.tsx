import { useEffect, useState } from 'react';
import { ThumbUp, ThumbDown } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { downvoteQuestion, upvoteQuestion } from '../../../services/questionService';
import { downvoteAnswer, upvoteAnswer } from '../../../services/answerService';
import './index.css';
import useUserContext from '../../../hooks/useUserContext';
import { Post } from '../../../types/types';
import useVoteStatus from '../../../hooks/useVoteStatus';

/**
 * Interface represents the props for the VoteComponent.
 *
 * post - The post object containing voting information.
 * pid - The id of the post object (PopulatedDatabaseQuestion or PopulatedDatabaseAnswer).
 * creatorUsername - The username of the creator of the post.
 * postType - If the post is a 'question' or 'answer'.
 */
interface VoteComponentProps {
  post: Post;
  pid: string;
  creatorUsername: string;
  postType: 'question' | 'answer';
  onVoteSuccess: () => void;
}

/**
 * A Vote component that allows users to upvote or downvote a question.
 *
 * @param post - The post object containing voting information.
 * @param pid - The id of the post object (PopulatedDatabaseQuestion or PopulatedDatabaseAnswer).
 * @param creatorUsername - The username of the creator of the post.
 * @param postType - If the post is a 'question' or 'answer'.
 * @param onVoteSuccess - The hook method to call on vote success.
 */
const VoteComponent = ({
  post,
  pid,
  creatorUsername,
  postType,
  onVoteSuccess,
}: VoteComponentProps) => {
  const { user } = useUserContext();
  const { count: initialCount, voted: initialVoted } = useVoteStatus({ post });

  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);

  useEffect(() => {
    setCount(initialCount);
    setVoted(initialVoted);
  }, [initialCount, initialVoted]);

  /**
   * Function to handle upvoting or downvoting a question.
   *
   * @param type - The type of vote, either 'upvote' or 'downvote'.
   */
  const handleVote = async (type: string) => {
    try {
      if (pid) {
        let newCount = count;
        let newVoted = voted;

        if (type === 'upvote') {
          if (voted === 1) {
            newCount -= 1;
            newVoted = 0;
          } else {
            newCount += voted === -1 ? 2 : 1;
            newVoted = 1;
          }
          if (postType === 'question')
            await upvoteQuestion(post, pid, creatorUsername, user.username);
          else await upvoteAnswer(post, pid, creatorUsername, user.username);
        } else if (type === 'downvote') {
          if (voted === -1) {
            newCount += 1;
            newVoted = 0;
          } else {
            newCount -= voted === 1 ? 2 : 1;
            newVoted = -1;
          }
          if (postType === 'question')
            await downvoteQuestion(post, pid, creatorUsername, user.username);
          else await downvoteAnswer(post, pid, creatorUsername, user.username);
        }

        setCount(newCount);
        setVoted(newVoted);
        onVoteSuccess();
      }
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div className='vote-container'>
      <IconButton
        onClick={() => handleVote('upvote')}
        color={voted === 1 ? 'success' : 'default'}
        aria-label='Upvote'>
        <ThumbUp />
      </IconButton>

      <span className='vote-count'>{count}</span>

      <IconButton
        onClick={() => handleVote('downvote')}
        color={voted === -1 ? 'error' : 'default'}
        aria-label='Downvote'>
        <ThumbDown />
      </IconButton>
    </div>
  );
};

export default VoteComponent;
