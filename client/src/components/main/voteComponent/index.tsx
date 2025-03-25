import { downvoteQuestion, upvoteQuestion } from '../../../services/questionService';
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
}

/**
 * A Vote component that allows users to upvote or downvote a question.
 *
 * @param post - The post object containing voting information.
 * @param pid - The id of the post object (PopulatedDatabaseQuestion or PopulatedDatabaseAnswer).
 * @param creatorUsername - The username of the creator of the post.
 * @param postType - If the post is a 'question' or 'answer'.
 */
const VoteComponent = ({ post, pid, creatorUsername, postType }: VoteComponentProps) => {
  const { user } = useUserContext();
  const { count, voted } = useVoteStatus({ post });

  /**
   * Function to handle upvoting or downvoting a question.
   *
   * @param type - The type of vote, either 'upvote' or 'downvote'.
   */
  const handleVote = async (type: string) => {
    try {
      if (pid) {
        if (type === 'upvote') {
          if (postType === 'question') {
            await upvoteQuestion(post, pid, creatorUsername, user.username);
          }
        } else if (type === 'downvote') {
          if (postType === 'question') {
            await downvoteQuestion(post, pid, creatorUsername, user.username);
          }
        }
      }
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div className='vote-container'>
      <button
        className={`vote-button ${voted === 1 ? 'vote-button-upvoted' : ''}`}
        onClick={() => handleVote('upvote')}>
        Upvote
      </button>
      <button
        className={`vote-button ${voted === -1 ? 'vote-button-downvoted' : ''}`}
        onClick={() => handleVote('downvote')}>
        Downvote
      </button>
      <span className='vote-count'>{count}</span>
    </div>
  );
};

export default VoteComponent;
