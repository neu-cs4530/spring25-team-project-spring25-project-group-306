import { useEffect, useState } from 'react';
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
  const { qid } = useParams();
  const navigate = useNavigate();

  const { user } = useUserContext();
  const [text, setText] = useState<string>('');
  const [textErr, setTextErr] = useState<string>('');
  const [questionID, setQuestionID] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const [imageMsg, setImageMsg] = useState<string>('No Image Uploaded');
  const [copySuccess, setCopySuccess] = useState(false);

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
    };

    const resAnswer = await addAnswer(questionID, answer);

    await upvoteAnswer(resAnswer as Post, String(resAnswer._id), resAnswer.ansBy, user.username);

    if (resAnswer && resAnswer._id) {
      // navigate to the question that was answered
      navigate(`/question/${questionID}`);
    }
  };

  // Function to copy code to clipboard
  const copyToClipboard = async (imageUrl: string | null) => {
    if (!imageUrl) {
      setImageMsg('No image uploaded');
      return;
    }
    setImageMsg('Copying to clipboard...');
    await navigator.clipboard.writeText(`![Image_Label](${imageUrl})`);
    setCopySuccess(true);
  };

  /**
   * Function to handle file input change and upload the image.
   *
   * @param e - The event object from the file input change.
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      setImageMsg('No file selected');
      return;
    }
    setImageMsg('Uploading...');
    const file = e.target.files[0];

    try {
      const uploadedImage = await uploadImage(file);
      setImage(uploadedImage);
      await copyToClipboard(uploadedImage); // Copy the image URL to clipboard
      setImageMsg(
        'Image link copied to clipboard! Paste it in your answer text to embed it in the answer.',
      );
      setCopySuccess(true);
    } catch (err) {
      setImageMsg('Failed to upload image');
    }
  };

  return {
    text,
    textErr,
    setText,
    postAnswer,
    handleFileChange,
    image,
    setImage,
    imageMsg,
    setImageMsg,
    copySuccess,
    setCopySuccess,
    setTextErr,
  };
};

export default useAnswerForm;
