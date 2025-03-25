import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tag } from '../../../types';
import useSubforumDetails from '../../../hooks/useSubforumDetails';
import useSubforumQuestions from '../../../hooks/useSubforumQuestions';
import AskQuestionModal from './AskQuestionModal';
import './index.css';

export const SubforumDetailsPage: React.FC = () => {
  const { subforumId } = useParams<{ subforumId: string }>();
  const {
    subforum,
    loading: subforumLoading,
    error: subforumError,
    isModerator,
    navigateToSettings,
    refetch: refetchSubforum,
  } = useSubforumDetails(subforumId);
  const {
    questions,
    loading: questionsLoading,
    error: questionsError,
    refetch: refetchQuestions,
  } = useSubforumQuestions(subforumId);
  const [isAskQuestionModalOpen, setIsAskQuestionModalOpen] = useState(false);

  if (subforumLoading || questionsLoading) {
    return <div className='loading'>Loading subforum details...</div>;
  }

  if (subforumError || !subforum) {
    return <div className='error'>Error: {subforumError || 'Subforum not found'}</div>;
  }

  const renderQuestionsList = () => {
    if (questionsError) {
      return <div className='error'>Error loading questions: {questionsError}</div>;
    }

    if (questions.length === 0) {
      return <p>No questions yet. Be the first to ask a question!</p>;
    }

    return questions.map(question => (
      <div key={question._id} className='question-card'>
        <h3>{question.title}</h3>
        <p className='question-preview'>{question.text.substring(0, 200)}</p>
        <div className='question-meta'>
          <span>Asked by {question.askedBy}</span>
          <span>{new Date(question.askDateTime).toLocaleDateString()}</span>
          <span>{question.answers?.length || 0} answers</span>
        </div>
        <div className='question-tags'>
          {question.tags.map((tag: Tag, index: number) => (
            <span key={index} className='tag'>
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <div className='subforum-details-container'>
      <div className='subforum-details-header'>
        <div className='subforum-title-section'>
          <h1>{subforum.title}</h1>
          {isModerator && (
            <button className='settings-button' onClick={navigateToSettings}>
              Edit Settings
            </button>
          )}
        </div>
        <p className='subforum-description'>{subforum.description}</p>
      </div>

      <div className='subforum-content'>
        <div className='subforum-sidebar'>
          <div className='subforum-stats'>
            <div className='stat-item'>
              <span className='stat-label'>Questions:</span>
              <span className='stat-value'>{subforum.questionCount || 0}</span>
            </div>
            <div className='stat-item'>
              <span className='stat-label'>Tags:</span>
              <span className='stat-value'>{subforum.tags?.length || 0}</span>
            </div>
          </div>

          <div className='subforum-moderators'>
            <h3>Moderators</h3>
            <ul>
              {subforum.moderators.map((mod, index) => (
                <li key={index}>{mod}</li>
              ))}
            </ul>
          </div>

          {subforum.rules && subforum.rules.length > 0 && (
            <div className='subforum-rules'>
              <h3>Rules</h3>
              <ol>
                {subforum.rules.map((rule, index) => (
                  <li key={index}>{rule}</li>
                ))}
              </ol>
            </div>
          )}

          {subforum.tags && subforum.tags.length > 0 && (
            <div className='subforum-tags'>
              <h3>Tags</h3>
              <div className='tags-list'>
                {subforum.tags.map((tag, index) => (
                  <span key={index} className='tag'>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className='subforum-questions'>
          <div className='questions-header'>
            <h2>Questions</h2>
            <button className='ask-question-btn' onClick={() => setIsAskQuestionModalOpen(true)}>
              Ask a Question
            </button>
          </div>
          <div className='questions-list'>{renderQuestionsList()}</div>
        </div>
      </div>

      {isAskQuestionModalOpen && (
        <AskQuestionModal
          isOpen={isAskQuestionModalOpen}
          onClose={() => setIsAskQuestionModalOpen(false)}
          subforumId={subforumId || ''}
          onQuestionAdded={() => {
            refetchQuestions();
            refetchSubforum();
          }}
        />
      )}
    </div>
  );
};

export default SubforumDetailsPage;
