import { useParams } from 'react-router-dom';
import { getMetaData } from '../../../tool';
import AnswerView from './answer';
import AnswerHeader from './header';
import { Comment } from '../../../types/types';
import './index.css';
import QuestionBody from './questionBody';
import VoteComponent from '../voteComponent';
import CommentSection from '../commentSection';
import useAnswerPage from '../../../hooks/useAnswerPage';
import useFetchKarma from '../../../hooks/useFetchKarma';
import useSubforumDetails from '../../../hooks/useSubforumDetails';

/**
 * AnswerPage component that displays the full content of a question along with its answers.
 * It also includes the functionality to vote, ask a new question, and post a new answer.
 */
const AnswerPage = () => {
  const {
    subforumId,
    questionID,
    question,
    karma,
    handleNewComment,
    handleNewAnswer,
    removeAnswer,
  } = useAnswerPage();
  const { isModerator } = useSubforumDetails(subforumId);
  const answerUsernames = question ? [...new Set(question.answers.map(a => a.ansBy))] : [];
  const karmaMap = useFetchKarma(answerUsernames);

  if (!question) {
    return null;
  }

  return (
    <>
      <VoteComponent question={question} />
      <AnswerHeader ansCount={question.answers.length} title={question.title} />
      <QuestionBody
        views={question.views.length}
        text={question.text}
        askby={question.askedBy}
        karma={karma}
        image={question.image}
        meta={getMetaData(new Date(question.askDateTime))}
      />
      <CommentSection
        comments={question.comments}
        handleAddComment={(comment: Comment) => handleNewComment(comment, 'question', questionID)}
      />
      {question.answers.map(a => (
        <div key={String(a._id)}>
          <button className='remove-button' onClick={() => removeAnswer(String(a._id))}>
            Remove
          </button>
          {isModerator && (
            <button className='remove-button' onClick={() => removeAnswer(String(a._id))}>
              Remove
            </button>
          )}
          <AnswerView
            key={String(a._id)}
            text={a.text}
            ansBy={a.ansBy}
            karma={karmaMap[a.ansBy] || 0}
            meta={getMetaData(new Date(a.ansDateTime))}
            comments={a.comments}
            image={a.image}
            handleAddComment={(comment: Comment) =>
              handleNewComment(comment, 'answer', String(a._id))
            }
          />
        </div>
      ))}
      <button
        className='bluebtn ansButton'
        onClick={() => {
          handleNewAnswer();
        }}>
        Answer Question
      </button>
    </>
  );
};

export default AnswerPage;
