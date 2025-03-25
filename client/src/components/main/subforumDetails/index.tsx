import React from 'react';
import { useParams } from 'react-router-dom';
import useSubforumDetails from '../../../hooks/useSubforumDetails';
import './index.css';

const SubforumDetailsPage: React.FC = () => {
  const { subforumId } = useParams<{ subforumId: string }>();
  const { subforum, loading, error, isModerator, navigateToSettings } =
    useSubforumDetails(subforumId);

  if (loading) {
    return <div className='loading'>Loading subforum details...</div>;
  }

  if (error) {
    return <div className='error'>Error: {error}</div>;
  }

  if (!subforum) {
    return <div className='error'>Subforum not found</div>;
  }

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
              <span className='stat-label'>Questions</span>
              <span className='stat-value'>{subforum.questionCount || 0}</span>
            </div>
            <div className='stat-item'>
              <span className='stat-label'>Tags</span>
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
            <button className='ask-question-btn'>Ask Question</button>
          </div>
          {/* Questions list will be added here */}
          <div className='questions-list'>
            {/* This will be implemented in a separate task */}
            <p>Questions will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubforumDetailsPage;
