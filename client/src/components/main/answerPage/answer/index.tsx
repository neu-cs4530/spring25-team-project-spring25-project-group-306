import MarkdownRenderer from '../../../../markdown';
import CommentSection from '../../commentSection';
import './index.css';
import '../../karma.css';
import { Comment, DatabaseComment } from '../../../../types/types';

/**
 * Interface representing the props for the AnswerView component.
 *
 * - text The content of the answer.
 * - ansBy The username of the user who wrote the answer.
 * - meta Additional metadata related to the answer.
 * - comments An array of comments associated with the answer.
 * - handleAddComment Callback function to handle adding a new comment.
 */
interface AnswerProps {
  text: string;
  ansBy: string;
  karma: number;
  meta: string;
  image?: string;
  comments: DatabaseComment[];
  handleAddComment: (comment: Comment) => void;
}

/**
 * AnswerView component that displays the content of an answer with the author's name and metadata.
 * The answer text is processed to handle hyperlinks, and a comment section is included.
 *
 * @param text The content of the answer.
 * @param ansBy The username of the answer's author.
 * @param meta Additional metadata related to the answer.
 * @param comments An array of comments associated with the answer.
 * @param handleAddComment Function to handle adding a new comment.
 */

const AnswerView = ({
  text,
  ansBy,
  meta,
  karma,
  image,
  comments,
  handleAddComment,
}: AnswerProps) => {
  let karmaClass = 'karma-grey';
  if (karma && karma < 0) {
    karmaClass = 'karma-red';
  } else if (karma && karma > 0) {
    karmaClass = 'karma-green';
  }

  return (
    <div className='answer right_padding'>
      <div className='answer_top'>
        <div className='answer_text'>
          <MarkdownRenderer text={text} />
        </div>
        <div className='answerAuthor'>
          <div className='answer_author'>{ansBy}</div>
          <div className={karmaClass}>{karma} karma</div>
          <div className='answer_question_meta'>{meta}</div>
          {image && (
            <img
              src={image}
              alt='answer'
              className='answer_image'
              style={{ width: '100%', maxWidth: '300px', height: 'auto' }}
            />
          )}
        </div>
      </div>

      <CommentSection comments={comments} handleAddComment={handleAddComment} />
    </div>
  );
};

export default AnswerView;
