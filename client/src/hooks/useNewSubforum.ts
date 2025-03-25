import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateSubforumRequest } from '@fake-stack-overflow/shared/types/subforum';
import useUserContext from './useUserContext';

/**
 * Custom hook to handle subforum creation and form validation
 *
 * @returns title - The current value of the title input
 * @returns description - The current value of the description input
 * @returns tags - The current value of the tags input
 * @returns rules - The current value of the rules input
 * @returns titleErr - Error message for the title field
 * @returns descriptionErr - Error message for the description field
 * @returns tagsErr - Error message for the tags field
 * @returns rulesErr - Error message for the rules field
 * @returns createSubforum - Function to validate the form and create a new subforum
 */
const useNewSubforum = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [rules, setRules] = useState('');

  const [titleErr, setTitleErr] = useState('');
  const [descriptionErr, setDescriptionErr] = useState('');
  const [tagsErr, setTagsErr] = useState('');
  const [rulesErr, setRulesErr] = useState('');

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

    if (!description) {
      setDescriptionErr('Description cannot be empty');
      isValid = false;
    } else {
      setDescriptionErr('');
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

    const rulesList = rules.split('\n').filter(rule => rule.trim() !== '');
    if (rulesList.length > 10) {
      setRulesErr('Cannot have more than 10 rules');
      isValid = false;
    } else {
      setRulesErr('');
    }

    return isValid;
  };

  const createSubforum = async () => {
    if (!validateForm()) return;

    const tagList = tags.split(' ').filter(tag => tag.trim() !== '');
    const rulesList = rules.split('\n').filter(rule => rule.trim() !== '');

    const subforumData: CreateSubforumRequest['body'] = {
      title,
      description,
      moderators: [user.username],
      tags: tagList,
      rules: rulesList,
    };

    try {
      const response = await fetch('http://localhost:8000/subforums', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(subforumData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to create subforum: ${errorData}`);
      }

      const data = await response.json();
      navigate(`/subforums/${data._id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create subforum');
    }
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    tags,
    setTags,
    rules,
    setRules,
    titleErr,
    descriptionErr,
    tagsErr,
    rulesErr,
    createSubforum,
  };
};

export default useNewSubforum;
