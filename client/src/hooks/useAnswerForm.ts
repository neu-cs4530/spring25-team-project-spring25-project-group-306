import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { validateHyperlink } from '../tool';
import { addAnswer } from '../services/answerService';
import useUserContext from './useUserContext';
import { Answer } from '../types/types';
import uploadImage from '../services/imageUploadService';

/**
 * Custom hook for managing the state and logic of an answer submission form.
 *
 * @returns text - the current text input for the answer.
 * @returns textErr - the error message related to the text input.
 * @returns setText - the function to update the answer text input.
 * @returns postAnswer - the function to submit the answer after validation.
 */
const useAnswerForm = () => {
  const { qid } = useParams();
  const navigate = useNavigate();

  const { user } = useUserContext();
  const [text, setText] = useState<string>('');
  const [textErr, setTextErr] = useState<string>('');
  const [questionID, setQuestionID] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    if (!qid) {
      setTextErr('Question ID is missing.');
      navigate('/home');
      return;
    }

    setQuestionID(qid);
  }, [qid, navigate]);

  /**
   * Function to post an answer to a question.
   * It validates the answer text and posts the answer if it is valid.
   */
  const postAnswer = async () => {
    let isValid = true;

    if (!text) {
      setTextErr('Answer text cannot be empty');
      isValid = false;
    }

    // Hyperlink validation
    if (!validateHyperlink(text)) {
      setTextErr('Invalid hyperlink format.');
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    const answer: Answer = {
      text,
      ansBy: user.username,
      ansDateTime: new Date(),
      comments: [],
      upVotes: [],
      downVotes: [],
      image: image || undefined,
    };

    const res = await addAnswer(questionID, answer);

    if (res && res._id) {
      // navigate to the question that was answered
      navigate(`/question/${questionID}`);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      setImage('No file selected');
      return;
    }
    setImage('Uploading...');
    const file = e.target.files[0];

    try {
      const imgUrl = await uploadImage(file);

      setImage(imgUrl);
    } catch (error) {
      setImage(`Error uploading image`);
      // eslint-disable-next-line no-console
      console.error(error); // Log the error to the console, ignore lint error
    }
  };

  return {
    text,
    textErr,
    setText,
    postAnswer,
    handleFileChange,
    image,
  };
};

export default useAnswerForm;
