import { getMetaData } from '../../../tool';
import AnswerView from './answer';
import AnswerHeader from './header';
import { Comment, Post } from '../../../types/types';
import './index.css';
import QuestionBody from './questionBody';
import VoteComponent from '../voteComponent';
import CommentSection from '../commentSection';
import useAnswerPage from '../../../hooks/useAnswerPage';
import useFetchKarma from '../../../hooks/useFetchKarma';

/**
 * AnswerPage component that displays the full content of a question along with its answers.
 * It also includes the functionality to vote, ask a new question, and post a new answer.
 */
const AnswerPage = () => {
  const { questionID, question, karma, handleNewComment, handleNewAnswer } = useAnswerPage();

  const answerUsernames = question ? [...new Set(question.answers.map(a => a.ansBy))] : [];
  const karmaMap = useFetchKarma(answerUsernames);

  if (!question) {
    return null;
  }

  return (
    <>
      <VoteComponent
        post={question as Post}
        pid={String(question._id)}
        creatorUsername={question.askedBy}
        postType={'question'}
      />
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
        <>
          <VoteComponent
            post={a as Post}
            pid={String(a._id)}
            creatorUsername={a.ansBy}
            postType={'answer'}
          />
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
        </>
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
