import React, { useState } from 'react';
import { SubforumWithRuntimeData } from '@fake-stack-overflow/shared';
import useSubforums from '../../hooks/useSubforums';
import useUserContext from '../../hooks/useUserContext';
import './subforumPage.css';

const SubforumPage: React.FC = () => {
  const { subforums, loading, error, navigateToSubforum, createNewSubforum, canCreateSubforum } =
    useSubforums();
  const { user } = useUserContext();
  const [errorMessageId, setErrorMessageId] = useState<string | null>(null);

  if (loading) {
    return <div className='loading'>Loading subforums...</div>;
  }

  if (error) {
    return <div className='error'>Error: {error}</div>;
  }

  const handleSubforumClick = (subforum: SubforumWithRuntimeData) => {
    if (!subforum.public && user && !subforum.members.includes(user.username)) {
      setErrorMessageId(subforum._id);
      setTimeout(() => setErrorMessageId(null), 3000); // Clear message after 3 seconds
      return;
    }
    navigateToSubforum(subforum._id);
  };

  return (
    <div className='right_main'>
      <div className='page-header'>
        <h1 className='page-title'>Subforums</h1>
        {canCreateSubforum() && (
          <button className='bluebtn' onClick={createNewSubforum}>
            Create New Subforum
          </button>
        )}
      </div>
      <div className='subforum-list'>
        {subforums.map(subforum => {
          const tags = subforum.tags || [];
          const isPrivate = !subforum.public;
          const isMember = user && subforum.members.includes(user.username);
          const showError = errorMessageId === subforum._id;

          return (
            <div
              key={subforum._id}
              className={`subforum-card ${showError ? 'show-error' : ''}`}
              onClick={() => handleSubforumClick(subforum)}>
              <div className='subforum-card-header'>
                <h2>
                  {subforum.title}
                  {isPrivate && !isMember && ' 🔒'}
                </h2>
                <div className='subforum-stats'>
                  <span>{subforum.questionCount || 0} questions</span>
                  <span>{tags.length} tags</span>
                  <span className='online-users'>{subforum.onlineUsers} online</span>
                </div>
              </div>
              {showError ? (
                <div className='private-error-message'>
                  This is a private subforum. You need to be a member to access it.
                </div>
              ) : (
                <p className='subforum-description'>{subforum.description}</p>
              )}
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
