import React, { useMemo } from 'react';
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
    refreshQuestion,
    removeAnswer,
  } = useAnswerPage();
  const { isModerator } = useSubforumDetails(subforumId);
  const answerUsernames = useMemo(
    () =>
      question && question.answers ? [...new Set(question.answers.map(a => a.ansBy))].sort() : [],
    [question],
  );
  const karmaMap = useFetchKarma(answerUsernames);

  const handleVoteSuccess = () => {
    refreshQuestion();
  };

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
        onVoteSuccess={handleVoteSuccess}
      />
      {question && question.answers && (
        <AnswerHeader ansCount={question.answers.length} title={question.title} />
      )}
      {question && question.views && (
        <QuestionBody
          views={question.views.length}
          text={question.text}
          askby={question.askedBy}
          karma={karma}
          image={question.image}
          meta={getMetaData(new Date(question.askDateTime))}
        />
      )}
      <CommentSection
        comments={question.comments}
        handleAddComment={(comment: Comment) => handleNewComment(comment, 'question', questionID)}
      />
      {question &&
        question.answers &&
        question.answers.map(a => (
          <React.Fragment key={String(a._id)}>
            <VoteComponent
              post={a as Post}
              pid={String(a._id)}
              creatorUsername={a.ansBy}
              postType={'answer'}
              onVoteSuccess={handleVoteSuccess}
            />
            <div key={String(a._id)}>
              {isModerator && (
                <button className='remove-button' onClick={() => removeAnswer(String(a._id))}>
                  Remove
                </button>
              )}
            </div>
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
          </React.Fragment>
        ))}
      <button
        className='bluebtn'
        onClick={() => {
          handleNewAnswer();
        }}>
        Answer Question
      </button>
    </>
  );
};

export default AnswerPage;
