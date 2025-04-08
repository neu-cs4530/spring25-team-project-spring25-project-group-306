import React from 'react';
import { useNavigate } from 'react-router-dom';
import useSubforumSettings from '../../../hooks/useSubforumSettings';
import './index.css';

/**
 * SubforumSettings component for managing subforum settings.
 * It includes fields for title, description, tags, moderators, members, rules, and visibility.
 * The component handles form submission, error handling, and deletion confirmation.
 *
 * @param {string} subforumId - The ID of the subforum being managed.
 * @returns {JSX.Element} The rendered SubforumSettings component.
 */
const SubforumSettings: React.FC<{ subforumId: string }> = ({ subforumId }) => {
  const navigate = useNavigate();
  const {
    title,
    setTitle,
    description,
    setDescription,
    tags,
    setTags,
    rules,
    setRules,
    moderators,
    setModerators,
    members,
    setMembers,
    isPublic,
    setIsPublic,
    titleErr,
    descriptionErr,
    tagsErr,
    rulesErr,
    moderatorsErr,
    membersErr,
    loading,
    error,
    updateError,
    showDeleteConfirm,
    setShowDeleteConfirm,
    updateSubforum,
    deleteSubforum,
    userList,
  } = useSubforumSettings(subforumId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSubforum();
  };

  const handleModeratorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModerators(e.target.value);
  };

  if (loading) {
    return <div className='loading'>Loading subforum settings...</div>;
  }

  if (error) {
    return <div className='error-message'>{error}</div>;
  }

  return (
    <div className='subforum-settings-container'>
      <h1>Subforum Settings</h1>
      {updateError && <div className='error-message'>{updateError}</div>}
      <div onSubmit={handleSubmit} className='subforum-settings-form'>
        <div className='form-group'>
          <label htmlFor='title'>Title</label>
          <input
            type='text'
            id='title'
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder='Enter subforum title'
            className={titleErr ? 'error' : ''}
          />
          {titleErr && <div className='error-message'>{titleErr}</div>}
        </div>

        <div className='form-group'>
          <label htmlFor='description'>Description</label>
          <textarea
            id='description'
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder='Enter subforum description'
            className={descriptionErr ? 'error' : ''}
          />
          {descriptionErr && <div className='error-message'>{descriptionErr}</div>}
        </div>

        <div className='form-group'>
          <label htmlFor='tags'>Tags (space-separated)</label>
          <input
            type='text'
            id='tags'
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder='Enter tags (space-separated)'
            className={tagsErr ? 'error' : ''}
          />
          {tagsErr && <div className='error-message'>{tagsErr}</div>}
        </div>

        <div className='form-group'>
          <label htmlFor='moderators'>Moderators (one per line)</label>
          <select
            id='moderators'
            value={moderators}
            onChange={handleModeratorChange}
            className={moderatorsErr ? 'error' : ''}>
            {userList.map(user => (
              <option
                key={user.username}
                value={user.username}
                className={moderators.includes(user.username) ? 'selected' : ''}>
                {user.username}
              </option>
            ))}
          </select>
          {moderatorsErr && <div className='error-message'>{moderatorsErr}</div>}
        </div>

        <div className='form-group'>
          <label htmlFor='rules'>Rules (one per line)</label>
          <textarea
            id='rules'
            value={rules}
            onChange={e => setRules(e.target.value)}
            placeholder='Enter rules (one per line)'
            className={rulesErr ? 'error' : ''}
          />
          {rulesErr && <div className='error-message'>{rulesErr}</div>}
        </div>

        <div className='form-group'>
          <label>Visibility</label>
          <div className='radio-group'>
            <label>
              <input
                type='radio'
                name='visibility'
                checked={isPublic}
                onChange={() => setIsPublic(true)}
              />
              Public
            </label>
            <label>
              <input
                type='radio'
                name='visibility'
                checked={!isPublic}
                onChange={() => setIsPublic(false)}
              />
              Private
            </label>
          </div>
        </div>

        {!isPublic && (
          <div className='form-group'>
            <label htmlFor='members'>Members (one per line)</label>
            <textarea
              id='members'
              value={members}
              onChange={e => setMembers(e.target.value)}
              placeholder='Enter members (one per line)'
              className={membersErr ? 'error' : ''}
            />
            {membersErr && <div className='error-message'>{membersErr}</div>}
          </div>
        )}

        <div className='form-actions'>
          <button
            type='button'
            onClick={() => navigate(`/subforums/${subforumId}`)}
            className='cancel-button'>
            Cancel
          </button>
          <button type='submit' className='submit-button'>
            Save Changes
          </button>
        </div>
      </div>
      <div className='danger-zone'>
        <h2>Danger Zone</h2>
        <button className='delete-button' onClick={() => setShowDeleteConfirm(true)}>
          Delete Subforum
        </button>
      </div>

      {showDeleteConfirm && (
        <div className='delete-confirmation-modal'>
          <div className='modal-content'>
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete this subforum? This action cannot be undone.</p>
            <div className='modal-actions'>
              <button onClick={() => setShowDeleteConfirm(false)} className='cancel-button'>
                Cancel
              </button>
              <button onClick={deleteSubforum} className='delete-button'>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubforumSettings;
