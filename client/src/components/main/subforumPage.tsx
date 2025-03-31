import React from 'react';
import useSubforums from '../../hooks/useSubforums';
import './subforumPage.css';

const SubforumPage: React.FC = () => {
  const { subforums, loading, error, navigateToSubforum, createNewSubforum, canCreateSubforum } =
    useSubforums();

  if (loading) {
    return <div className='loading'>Loading subforums...</div>;
  }

  if (error) {
    return <div className='error'>Error: {error}</div>;
  }

  return (
    <div className='subforum-container'>
      <div className='subforum-header'>
        <h1>Subforums</h1>
        {canCreateSubforum() && (
          <button className='create-subforum-btn' onClick={createNewSubforum}>
            Create New Subforum
          </button>
        )}
      </div>
      <div className='subforum-list'>
        {subforums.map(subforum => {
          const tags = subforum.tags || [];
          return (
            <div key={subforum._id} className='subforum-card'>
              <div className='subforum-card-header'>
                <h2 onClick={() => navigateToSubforum(subforum._id)}>{subforum.title}</h2>
                <div className='subforum-stats'>
                  <span>{subforum.questionCount || 0} questions</span>
                  <span>{tags.length} tags</span>
                  <span className='online-users'>{subforum.onlineUsers} online</span>
                </div>
              </div>
              <p className='subforum-description'>{subforum.description}</p>
              <div className='subforum-footer'>
                <div className='subforum-tags'>
                  {tags.slice(0, 3).map((tag: string, index: number) => (
                    <span key={index} className='tag'>
                      {tag}
                    </span>
                  ))}
                  {tags.length > 3 && (
                    <span className='tag more-tags'>+{tags.length - 3} more</span>
                  )}
                </div>
                <div className='subforum-moderators'>
                  Moderators: {subforum.moderators?.join(', ') || 'None'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SubforumPage;
