import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tag, Question } from '../../../types';
import useSubforumDetails from '../../../hooks/useSubforumDetails';
import useSubforumQuestions from '../../../hooks/useSubforumQuestions';
import NewQuestion from '../newQuestion';
import './index.css';

/**
 * SubforumDetailsPage component displays the details of a specific subforum,
 * including its title, description, rules, moderators, and a list of questions.
 * It allows moderators to pin/unpin questions and add new questions.
 * It also provides a button to navigate to the subforum settings.
 */
const SubforumDetailsPage: React.FC = () => {
  const navigate = useNavigate();
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
    questionsPinned,
    questionsUnpinned,
    handlePinUnpinQuestion,
    loading: questionsLoading,
    error: questionsError,
    refetch: refetchQuestions,
    deleteQuestion,
  } = useSubforumQuestions(subforumId);

  const [isNewQuestionOpen, setIsNewQuestionOpen] = useState(false);

  if (subforumLoading || questionsLoading) {
    return <div className='loading'>Loading subforum details...</div>;
  }

  if (subforumError || !subforum) {
    return <div className='error'>Error: {subforumError || 'Subforum not found'}</div>;
  }

  /**
   * This function is used to handle the click event on a question title.
   * It navigates the user to the question details page.
   * It checks if the question ID and subforum ID are available before navigating.
   * If either ID is missing, it throws an error.
   * This ensures that the navigation only occurs when valid IDs are provided.
   * @param question The question object to navigate to.
   *
   * @returns {void}
   * @throws {Error} If the question ID or subforum ID is not available.
   */
  const handleQuestionClick = (question: Question): void => {
    if (question._id && subforumId) {
      navigate(`/question/${question._id}`);
    }
  };

  /**
   * This function is used to handle the click event on the "Ask a Question" button.
   * It opens the modal for asking a new question.
   *
   * @returns {void}
   */
  const renderQuestion = (question: Question) => {
    if (questionsError) {
      return <div className='error'>Error loading question: {questionsError}</div>;
    }
    return (
      <div key={question._id} className='question-card'>
        <h3 onClick={() => handleQuestionClick(question)} className='question-title'>
          {question.title}
        </h3>
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
        <div className='question-actions'>
          {isModerator && (
            <div className='mod-buttons'>
              <button
                className='pin-button'
                onClick={() => {
                  handlePinUnpinQuestion(question._id, !question.pinned)
                    .then(() => {
                      // Optionally refetch data to ensure consistency
                      refetchQuestions();
                    })
                    .catch(() => {
                      // Revert the optimistic update if the API call fails
                      question.pinned = !question.pinned;
                    });
                }}>
                {question.pinned ? 'Unpin' : 'Pin'}
              </button>
              <button className='remove-button' onClick={() => deleteQuestion(question._id)}>
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderQuestionsPinnedList = () => {
    if (questionsError) {
      return <div className='error'>Error loading pinned questions: {questionsError}</div>;
    }
    return questionsPinned
      .filter(question => question.pinned)
      .map(question => renderQuestion(question));
  };

  const renderQuestionsUnpinnedList = () => {
    if (questionsError) {
      return <div className='error'>Error loading unpinned questions: {questionsError}</div>;
    }
    if (questionsUnpinned.length === 0) {
      return <div className='no-questions'>No questions available</div>;
    }
    return questionsUnpinned.map(question => renderQuestion(question));
  };

  return (
    <div className='subforum-details-container'>
      <div className='subforum-details-header'>
        <div className='subforum-title-section'>
          <h1>{subforum.title}</h1>
          <div className='subforum-header-actions'>
            <span className='online-users-indicator'>{subforum.onlineUsers} online now</span>
            {isModerator && (
              <button className='settings-button' onClick={navigateToSettings}>
                Edit Settings
              </button>
            )}
          </div>
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
            <div className='stat-item'>
              <span className='stat-label'>Online users:</span>
              <span className='stat-value online-count'>{subforum.onlineUsers}</span>
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
            <button className='ask-question-btn' onClick={() => setIsNewQuestionOpen(true)}>
              Ask a Question
            </button>
          </div>
          {questionsPinned.length > 0 && (
            <div className='pinned-questions-section'>
              <h3>Pinned Questions</h3>
              <div className='questions-list'>{renderQuestionsPinnedList()}</div>
              <p>----</p>
            </div>
          )}
          <div className='questions-list'>{renderQuestionsUnpinnedList()}</div>
        </div>
      </div>

      {isNewQuestionOpen && (
        <div className='new-question-modal'>
          <div className='modal-content'>
            <button className='close-button' onClick={() => setIsNewQuestionOpen(false)}>
              ×
            </button>
            <NewQuestion
              subforumId={subforumId}
              onQuestionAdded={() => {
                refetchQuestions();
                refetchSubforum();
                setIsNewQuestionOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SubforumDetailsPage;
