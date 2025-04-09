import './index.css';
import React from 'react';
import Form from '../baseComponents/form';
import TextArea from '../baseComponents/textarea';
import useAnswerForm from '../../../hooks/useAnswerForm';

/**
 * NewAnswerPage component allows users to submit an answer to a specific question.
 */
const NewAnswerPage = () => {
  const [localImagePreview, setLocalImagePreview] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { text, textErr, setText, postAnswer, handleFileChange, image, setImage, imageMsg } = useAnswerForm();


  // Handle image upload completely on the client side
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      await handleFileChange(e);
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
    <Form>
      <TextArea
        title={'Answer Text'}
        id={'answerTextInput'}
        val={text}
        setState={setText}
        err={textErr}
      />
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
            </div>)}
            <p>{imageMsg}</p>
        </div>
        <button
          className='form_postBtn'
          onClick={async () => {
            setIsSubmitting(true);
            try {
              await postAnswer();
            } finally {
              setIsSubmitting(false);
            }
          }}
          disabled={isSubmitting}>
          Post Answer
        </button>
        <div className='mandatory_indicator'>* indicates mandatory fields</div>
    </Form>
  );
};

export default NewAnswerPage;
function setError(arg0: string) {
  throw new Error('Function not implemented.');
}

