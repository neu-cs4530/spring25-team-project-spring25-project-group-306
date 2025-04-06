import React from 'react';
import './index.css';
import TagView from './tag';
import useTagPage from '../../../hooks/useTagPage';

/**
 * Represents the TagPage component which displays a list of tags
 * and provides functionality to handle tag clicks and ask a new question.
 */
const TagPage = () => {
  const { tlist, clickTag } = useTagPage();

  return (
    <div className='right_main'>
      <div className='page-header'>
        <h1 className='page-title'>Tags</h1>
        <p className='page-description'>{tlist.length} tags</p>
      </div>
      <div className='tags-grid'>
        {tlist.map(t => (
          <TagView key={t.name} t={t} clickTag={clickTag} />
        ))}
      </div>
      {tlist.length === 0 && <div className='bold_title'>No Tags Found</div>}
    </div>
  );
};

export default TagPage;
