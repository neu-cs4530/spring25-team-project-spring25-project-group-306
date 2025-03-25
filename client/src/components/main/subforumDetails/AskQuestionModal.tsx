import React, { useState } from 'react';
import Form from '../baseComponents/form';
import Input from '../baseComponents/input';
import TextArea from '../baseComponents/textarea';
import useUserContext from '../../../hooks/useUserContext';
import './index.css';

interface AskQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subforumId: string;
  onQuestionAdded?: () => void;
}

const AskQuestionModal: React.FC<AskQuestionModalProps> = ({
  isOpen,
  onClose,
  subforumId,
  onQuestionAdded,
}) => {
  const { user } = useUserContext();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [titleErr, setTitleErr] = useState('');
  const [contentErr, setContentErr] = useState('');
  const [tagsErr, setTagsErr] = useState('');
  const [error, setError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    let isValid = true;

    if (!user) {
      setError('You must be logged in to ask a question');
      return false;
    }

    if (!title) {
      setTitleErr('Title cannot be empty');
      isValid = false;
    } else if (title.length > 100) {
      setTitleErr('Title cannot be more than 100 characters');
      isValid = false;
    } else {
      setTitleErr('');
    }

    if (!content) {
      setContentErr('Content cannot be empty');
      isValid = false;
    } else {
      setContentErr('');
    }

    const tagList = tags.split(' ').filter(tag => tag.trim() !== '');
    if (tagList.length > 5) {
      setTagsErr('Cannot have more than 5 tags');
      isValid = false;
    } else {
      for (const tag of tagList) {
        if (tag.length > 20) {
          setTagsErr('Tag length cannot be more than 20 characters');
          isValid = false;
          break;
        }
      }
      if (isValid) {
        setTagsErr('');
      }
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/question/addQuestion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title,
          text: content,
          tags: tags
            .split(' ')
            .filter(tag => tag.trim() !== '')
            .map(tag => ({
              name: tag.toLowerCase(),
              description: `Tag for ${tag}`,
            })),
          askedBy: user.username,
          askDateTime: new Date(),
          subforumId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create question');
      }

      onClose();
      if (onQuestionAdded) {
        onQuestionAdded();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create question');
    }
  };

  return (
    <div className='modal-overlay'>
      <div className='modal-content'>
        <h2>Ask a Question</h2>
        {error && <div className='error'>{error}</div>}
        <Form>
          <Input
            title='Question Title *'
            hint='Limit title to 100 characters or less'
            id='questionTitleInput'
            val={title}
            setState={setTitle}
            err={titleErr}
          />
          <TextArea
            title='Question Content *'
            hint='Describe your question in detail'
            id='questionContentInput'
            val={content}
            setState={setContent}
            err={contentErr}
          />
          <Input
            title='Tags'
            hint='Add keywords separated by whitespace'
            id='questionTagsInput'
            val={tags}
            setState={setTags}
            err={tagsErr}
          />
          <div className='modal-actions'>
            <button className='cancel-button' onClick={onClose}>
              Cancel
            </button>
            <button className='submit-button' onClick={handleSubmit}>
              Ask Question
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default AskQuestionModal;
