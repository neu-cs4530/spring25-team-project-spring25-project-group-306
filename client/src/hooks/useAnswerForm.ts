import { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { validateHyperlink } from '../tool';
import { addAnswer, upvoteAnswer } from '../services/answerService';
import useUserContext from './useUserContext';
import { Answer, Post } from '../types/types';
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
  const { subforumId, qid } = useParams();
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

    const resAnswer = await addAnswer(questionID, answer);

    await upvoteAnswer(resAnswer as Post, String(resAnswer._id), resAnswer.ansBy, user.username);

    if (resAnswer && resAnswer._id) {
      // navigate to the question that was answered
      navigate(`/subforums/${subforumId}/question/${questionID}`);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }
    setImage('Uploading...');
    const file = e.target.files[0];

    try {
      const imageURL = await uploadImage(file);
      setImage(imageURL);
    } catch (err) {
      setTextErr('Error uploading image');
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
