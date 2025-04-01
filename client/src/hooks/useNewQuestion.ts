import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateHyperlink } from '../tool';
import { addQuestion, upvoteQuestion } from '../services/questionService';
import useUserContext from './useUserContext';
import { Post, Question } from '../types/types';
import uploadImage from '../services/imageUploadService';

/**
 * Custom hook to handle question submission and form validation
 *
 * @returns title - The current value of the title input.
 * @returns text - The current value of the text input.
 * @returns tagNames - The current value of the tags input.
 * @returns titleErr - Error message for the title field, if any.
 * @returns textErr - Error message for the text field, if any.
 * @returns tagErr - Error message for the tag field, if any.
 * @returns image - The current value of the image input.
 * @returns postQuestion - Function to validate the form and submit a new question.
 */
const useNewQuestion = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [title, setTitle] = useState<string>('');
  const [text, setText] = useState<string>('');
  const [tagNames, setTagNames] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);

  const [titleErr, setTitleErr] = useState<string>('');
  const [textErr, setTextErr] = useState<string>('');
  const [tagErr, setTagErr] = useState<string>('');
  const [imageErr, setImageErr] = useState<string>('');

  /**
   * Function to validate the form before submitting the question.
   *
   * @returns boolean - True if the form is valid, false otherwise.
   */
  const validateForm = (): boolean => {
    let isValid = true;

    if (!title) {
      setTitleErr('Title cannot be empty');
      isValid = false;
    } else if (title.length > 100) {
      setTitleErr('Title cannot be more than 100 characters');
      isValid = false;
    } else {
      setTitleErr('');
    }

    if (!text) {
      setTextErr('Question text cannot be empty');
      isValid = false;
    } else if (!validateHyperlink(text)) {
      setTextErr('Invalid hyperlink format.');
      isValid = false;
    } else {
      setTextErr('');
    }

    const tagnames = tagNames.split(' ').filter(tagName => tagName.trim() !== '');
    if (tagnames.length === 0) {
      setTagErr('Should have at least 1 tag');
      isValid = false;
    } else if (tagnames.length > 5) {
      setTagErr('Cannot have more than 5 tags');
      isValid = false;
    } else {
      setTagErr('');
    }

    for (const tagName of tagnames) {
      if (tagName.length > 20) {
        setTagErr('New tag length cannot be more than 20');
        isValid = false;
        break;
      }
    }

    return isValid;
  };

  /**
   * Function to post a question to the server.
   *
   * @returns title - The current value of the title input.
   */
  const postQuestion = async () => {
    if (!validateForm()) return;

    const tagnames = tagNames.split(' ').filter(tagName => tagName.trim() !== '');
    const tags = tagnames.map(tagName => ({
      name: tagName,
      description: 'user added tag',
    }));

    const question: Question = {
      title,
      text,
      tags,
      askedBy: user.username,
      askDateTime: new Date(),
      answers: [],
      upVotes: [],
      downVotes: [],
      views: [],
      comments: [],
      image: image || undefined,
    };

    const resQuestion = await addQuestion(question);

    await upvoteQuestion(
      resQuestion as Post,
      String(resQuestion._id),
      resQuestion.askedBy,
      user.username,
    );

    if (resQuestion && resQuestion._id) {
      navigate('/home');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      setImageErr('No file selected');
      return;
    }
    const file = e.target.files[0];

    try {
      const imageURL = await uploadImage(file);
      setImage(imageURL);
      setImageErr('');
    } catch (err) {
      setImageErr('Failed to upload image');
    }
  };

  return {
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
    imageErr,
    postQuestion,
    handleFileChange,
  };
};

export default useNewQuestion;
