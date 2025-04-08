import React from 'react';
import { useNavigate } from 'react-router-dom';
import useNewSubforum from '../../../hooks/useNewSubforum';
import './index.css';

/**
 * NewSubforum component for creating a new subforum.
 * It includes fields for title, description, tags, moderators, members, rules, and visibility.
 * The component handles form submission and error handling.
 *
 * @returns {JSX.Element} The rendered NewSubforum component.
 */
const NewSubforum: React.FC = () => {
  const navigate = useNavigate();
  const {
    title,
    setTitle,
    description,
    setDescription,
    tags,
    setTags,
    moderators,
    setModerators,
    members,
    setMembers,
    rules,
    setRules,
    isPublic,
    setIsPublic,
    titleErr,
    descriptionErr,
    tagsErr,
    moderatorsErr,
    membersErr,
    rulesErr,
    error,
    createSubforum,
    userList,
  } = useNewSubforum();

  const handleSubmit = () => {
    createSubforum();
  };

  const handleModeratorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModerators = e.target.value.split(',').map(mod => mod.trim());
    const updatedModerators = Array.from(new Set([...moderators, ...newModerators]));
    setModerators(updatedModerators);
  };

  const handleMembersChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const membersArray = e.target.value.split(',').map(member => member.trim());
    setMembers(membersArray);
  };

  return (
    <div className='new-subforum-container'>
      <h1>Create a New Subforum</h1>
      {error && <div className='error-message'>{error}</div>}
      <div onSubmit={handleSubmit} className='new-subforum-form'>
        <div className='form-group'>
          <label htmlFor='title'>Title *</label>
          <input
            type='text'
            id='title'
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder='Enter a descriptive title'
            className={titleErr ? 'error' : ''}
          />
          {titleErr && <div className='error-message'>{titleErr}</div>}
          <div className='hint'>Choose a clear, specific title (max 100 characters)</div>
        </div>

        <div className='form-group'>
          <label htmlFor='description'>Description *</label>
          <textarea
            id='description'
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder='Describe the purpose and topic of your subforum'
            className={descriptionErr ? 'error' : ''}
          />
          {descriptionErr && <div className='error-message'>{descriptionErr}</div>}
          <div className='hint'>Provide clear guidelines about the subforum&apos;s focus</div>
        </div>

        <div className='form-group'>
          <label htmlFor='tags'>Tags</label>
          <input
            type='text'
            id='tags'
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder='e.g., programming javascript react'
            className={tagsErr ? 'error' : ''}
          />
          {tagsErr && <div className='error-message'>{tagsErr}</div>}
          <div className='hint'>
            Add up to 5 space-separated tags to help categorize your subforum
          </div>
        </div>

        <div className='form-group'>
          <label htmlFor='moderators'>Add Moderators *</label>
          <select
            id='moderators'
            value={moderators[-1]}
            onChange={handleModeratorChange}
            className={moderatorsErr ? 'error' : ''}>
            {userList.map(member => (
              <option
                key={member.username}
                value={member.username}
                className={moderators.includes(member.username) ? 'selected' : ''}>
                {member.username}
              </option>
            ))}
          </select>
          <div className='moderator-list'>
            <h3>Current Moderators</h3>
            <ul>
              {moderators.map(moderator => (
                <li key={moderator}>{moderator}</li>
              ))}
            </ul>
          </div>
          {moderatorsErr && <div className='error-message'>{moderatorsErr}</div>}
          <div className='hint'>
            List usernames of moderators who will help manage this subforum
          </div>
        </div>

        <div className='form-group'>
          <label htmlFor='rules'>Rules</label>
          <textarea
            id='rules'
            value={rules}
            onChange={e => setRules(e.target.value)}
            placeholder='Enter subforum rules (one per line)'
            className={rulesErr ? 'error' : ''}
          />
          {rulesErr && <div className='error-message'>{rulesErr}</div>}
          <div className='hint'>Add up to 10 rules to guide participation (optional)</div>
        </div>

        <div className='form-group'>
          <label>Visibility *</label>
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
          <div className='hint'>
            {isPublic
              ? 'Public subforums are visible to all users'
              : 'Private subforums are only visible to members'}
          </div>
        </div>

        {!isPublic && (
          <div className='form-group'>
            <label htmlFor='members'>Members *</label>
            <textarea
              id='members'
              value={members}
              onChange={e => handleMembersChange(e)}
              placeholder='Enter member usernames (one per line)'
              className={membersErr ? 'error' : ''}
            />
            {membersErr && <div className='error-message'>{membersErr}</div>}
            <div className='hint'>
              List usernames of members who can access this private subforum
            </div>
          </div>
        )}

        <div className='form-actions'>
          <button type='button' onClick={() => navigate('/subforums')} className='cancel-button-1'>
            Cancel
          </button>
          <button type='button' onClick={() => handleSubmit()} className='submit-button-1'>
            Create Subforum
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewSubforum;
