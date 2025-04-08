import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserContext from '../../../hooks/useUserContext';
import useNewQuestion from '../../../hooks/useNewQuestion';
import './index.css';

/**
 * NewQuestion component for creating a new question.
 * It includes fields for title, text, tags, and an optional image upload.
 * The component handles form submission, image upload, and error handling.
 */
interface NewQuestionProps {
  subforumId?: string;
  onQuestionAdded?: () => void;
}

/**
 * NewQuestion component that allows users to ask a new question.
 * It includes fields for title, text, tags, and an optional image upload.
 * The component handles form submission, image upload, and error handling.
 *
 * @param subforumId Optional ID of the subforum where the question is being asked.
 * @param onQuestionAdded Optional callback function to be called after a question is successfully added.
 */
const NewQuestion: React.FC<NewQuestionProps> = ({ subforumId, onQuestionAdded }) => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localImagePreview, setLocalImagePreview] = useState<string | null>(null);

  // Use the existing hook for form handling
  const {
    title,
    setTitle,
    text,
    setText,
    tagNames,
    setTagNames,
    image,
    setImage,
    titleErr,
    textErr,
    tagErr,
    postQuestion,
    handleFileChange,
  } = useNewQuestion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!user) {
      setError('You must be logged in to ask a question');
      setIsSubmitting(false);
      return;
    }

    try {
      // If we have a local image preview but no server image, use the local one
      if (localImagePreview && !image) {
        setImage(localImagePreview);
      }

      // Create a custom postQuestion function that includes the subforumId
      const postQuestionWithSubforum = async () => {
        // Create a modified version of the postQuestion function that includes the subforumId
        const modifiedPostQuestion = async () => {
          // Get the current question data
          const questionData = {
            title,
            text,
            tags: tagNames
              .split(' ')
              .filter(tag => tag.trim() !== '')
              .map(tag => ({
                name: tag,
                description: 'user added tag',
              })),
            askedBy: user.username,
            askDateTime: new Date(),
            image: image || undefined,
            subforumId, // Include the subforumId
          };

          // Make the API request directly
          const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/question/addQuestion`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(questionData),
          });

          if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData);
          }

          const data = await response.json();

          // After posting, if we have a callback, call it
          if (onQuestionAdded) {
            onQuestionAdded();
          } else {
            navigate(`/questions/${data._id}`);
          }
        };

        // Call our modified function
        await modifiedPostQuestion();
      };

      // Call the appropriate function based on whether we're in a subforum
      if (subforumId) {
        await postQuestionWithSubforum();
      } else {
        await postQuestion();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create question');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle image upload completely on the client side
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFileChange(e);
    if (!file) return;

    // Check file type
    if (!file.type.match('image/(jpeg|png|jpg)')) {
      setError('Only JPEG, PNG, and JPG images are allowed');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    // Create a local preview
    const reader = new FileReader();
    reader.onload = event => {
      if (event.target?.result) {
        const imageData = event.target.result as string;
        setLocalImagePreview(imageData);
        // Also set the image in the hook to ensure it's included in the question
        setImage(imageData);
        setError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Determine which image to display (server-uploaded or local preview)
  const displayImage = image || localImagePreview;

  return (
    <div className='new-question-container'>
      <h2>{subforumId ? 'Ask a Question in this Subforum' : 'Ask a Question'}</h2>

      {error && <div className='error-message'>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <label htmlFor='title'>Title</label>
          <input
            type='text'
            id='title'
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder='What is your question? Be specific.'
            disabled={isSubmitting}
          />
          {titleErr && <div className='error-message'>{titleErr}</div>}
          <small className='form-hint'>
            A clear, concise title helps others find your question
          </small>
        </div>

        <div className='form-group'>
          <label htmlFor='text'>Details</label>
          <textarea
            id='text'
            value={text}
            onChange={e => setText(e.target.value)}
            required
            placeholder='Provide more context about your question. Include any relevant code, error messages, or examples.'
            rows={10}
            disabled={isSubmitting}
          />
          {textErr && <div className='error-message'>{textErr}</div>}
          <small className='form-hint'>
            The more details you provide, the better answers you&apos;ll receive
          </small>
        </div>

        <div className='form-group'>
          <label htmlFor='tags'>Tags</label>
          <input
            type='text'
            id='tags'
            value={tagNames}
            onChange={e => setTagNames(e.target.value)}
            placeholder='Add tags separated by spaces (e.g., javascript react typescript)'
            disabled={isSubmitting}
          />
          {tagErr && <div className='error-message'>{tagErr}</div>}
          <small className='form-hint'>
            Tags help others find your question and categorize it properly
          </small>
        </div>

        <div className='form-group'>
          <label htmlFor='image'>Image (Optional)</label>
          <input
            type='file'
            id='image'
            accept='.jpg,.jpeg,.png'
            onChange={handleImageUpload}
            disabled={isSubmitting}
          />
          <small className='form-hint'>
            Upload an image to help illustrate your question (max 5MB, JPG/PNG only)
          </small>
          {displayImage && (
            <div className='image-preview'>
              <img src={displayImage} alt='Preview' />
              <button
                type='button'
                className='remove-image-btn'
                onClick={() => {
                  setImage(null);
                  setLocalImagePreview(null);
                }}
                disabled={isSubmitting}>
                Remove Image
              </button>
            </div>
          )}
          <p>Link: {image}</p>
        </div>

        <button type='submit' className='submit-button' disabled={isSubmitting}>
          {isSubmitting ? 'Posting...' : 'Post Question'}
        </button>
      </form>
    </div>
  );
};

export default NewQuestion;
