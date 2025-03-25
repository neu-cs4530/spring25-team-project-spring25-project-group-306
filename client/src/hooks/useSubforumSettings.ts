import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DatabaseSubforum,
  DatabaseUpdateSubforumRequest,
} from '@fake-stack-overflow/shared/types/subforum';
import useUserContext from './useUserContext';

const useSubforumSettings = (subforumId: string | undefined) => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [rules, setRules] = useState('');
  const [moderators, setModerators] = useState('');

  const [titleErr, setTitleErr] = useState('');
  const [descriptionErr, setDescriptionErr] = useState('');
  const [tagsErr, setTagsErr] = useState('');
  const [rulesErr, setRulesErr] = useState('');
  const [moderatorsErr, setModeratorsErr] = useState('');

  useEffect(() => {
    const fetchSubforum = async () => {
      if (!subforumId) {
        setError('No subforum ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/subforums/${subforumId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch subforum');
        }

        const data: DatabaseSubforum = await response.json();

        // Check if user is a moderator
        if (!data.moderators.includes(user?.username || '')) {
          navigate('/subforums');
          return;
        }

        setTitle(data.title);
        setDescription(data.description);
        setTags(data.tags?.join(' ') || '');
        setRules(data.rules?.join('\n') || '');
        setModerators(data.moderators.join('\n'));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSubforum();
  }, [subforumId, user?.username, navigate]);

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

  const updateSubforum = async () => {
    if (!validateForm() || !subforumId) return;

    const tagList = tags.split(' ').filter(tag => tag.trim() !== '');
    const rulesList = rules.split('\n').filter(rule => rule.trim() !== '');
    const moderatorsList = moderators.split('\n').filter(mod => mod.trim() !== '');

    const updateData: DatabaseUpdateSubforumRequest = {
      title,
      description,
      moderators: moderatorsList,
      tags: tagList,
      rules: rulesList,
      updatedAt: new Date(),
    };

    try {
      const response = await fetch(`http://localhost:8000/subforums/${subforumId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.text();

        throw new Error(`Failed to update subforum: ${errorData}`);
      }

      navigate(`/subforums/${subforumId}`);
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to update subforum');
    }
  };

  const deleteSubforum = async () => {
    if (!subforumId) return;

    try {
      const response = await fetch(`http://localhost:8000/subforums/${subforumId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to delete subforum: ${errorData}`);
      }

      navigate('/subforums');
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : 'Failed to delete subforum');
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
    moderators,
    setModerators,
    titleErr,
    descriptionErr,
    tagsErr,
    rulesErr,
    moderatorsErr,
    loading,
    error,
    updateError,
    showDeleteConfirm,
    setShowDeleteConfirm,
    updateSubforum,
    deleteSubforum,
  };
};

export default useSubforumSettings;
