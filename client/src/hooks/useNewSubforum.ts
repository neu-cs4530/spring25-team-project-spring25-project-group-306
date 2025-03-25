import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateSubforumRequest } from '@fake-stack-overflow/shared/types/subforum';

/**
 * Custom hook to handle subforum creation and form validation
 *
 * @returns title - The current value of the title input
 * @returns description - The current value of the description input
 * @returns tags - The current value of the tags input
 * @returns moderators - The current value of the moderators input
 * @returns rules - The current value of the rules input
 * @returns titleErr - Error message for the title field
 * @returns descriptionErr - Error message for the description field
 * @returns tagsErr - Error message for the tags field
 * @returns moderatorsErr - Error message for the moderators field
 * @returns rulesErr - Error message for the rules field
 * @returns error - Error message for the subforum creation
 * @returns createSubforum - Function to validate the form and create a new subforum
 */
const useNewSubforum = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [moderators, setModerators] = useState('');
  const [rules, setRules] = useState('');
  const [titleErr, setTitleErr] = useState('');
  const [descriptionErr, setDescriptionErr] = useState('');
  const [tagsErr, setTagsErr] = useState('');
  const [moderatorsErr, setModeratorsErr] = useState('');
  const [rulesErr, setRulesErr] = useState('');
  const [error, setError] = useState<string | null>(null);

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

    const moderatorsList = moderators.split('\n').filter(mod => mod.trim() !== '');
    if (moderatorsList.length === 0) {
      setModeratorsErr('Must have at least one moderator');
      isValid = false;
    } else {
      setModeratorsErr('');
    }

    return isValid;
  };

  const createSubforum = async () => {
    if (!validateForm()) return;

    const tagList = tags.split(' ').filter(tag => tag.trim() !== '');
    const rulesList = rules.split('\n').filter(rule => rule.trim() !== '');
    const moderatorsList = moderators.split('\n').filter(mod => mod.trim() !== '');

    const subforumData: CreateSubforumRequest['body'] = {
      title,
      description,
      moderators: moderatorsList,
      tags: tagList,
      rules: rulesList,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/subforums`, {
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

      navigate('/subforums');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create subforum');
    }
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    tags,
    setTags,
    moderators,
    setModerators,
    rules,
    setRules,
    titleErr,
    descriptionErr,
    tagsErr,
    moderatorsErr,
    rulesErr,
    error,
    createSubforum,
  };
};

export default useNewSubforum;
