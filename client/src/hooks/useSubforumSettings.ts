import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DatabaseSubforum,
  DatabaseUpdateSubforumRequest,
} from '@fake-stack-overflow/shared/types/subforum';
import useUserContext from './useUserContext';

/**
 * Custom hook to manage subforum settings and updates.
 *
 * @param subforumId - The ID of the subforum to manage.
 * @returns An object containing state variables and functions for managing subforum settings.
 */
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
  const [members, setMembers] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [titleErr, setTitleErr] = useState('');
  const [descriptionErr, setDescriptionErr] = useState('');
  const [tagsErr, setTagsErr] = useState('');
  const [rulesErr, setRulesErr] = useState('');
  const [moderatorsErr, setModeratorsErr] = useState('');
  const [membersErr, setMembersErr] = useState('');

  useEffect(() => {
    const fetchSubforum = async () => {
      if (!subforumId) {
        setError('No subforum ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.REACT_APP_SERVER_URL}/subforums/${subforumId}`,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          },
        );

        if (!response.ok) {
          throw new Error('Failed to fetch subforum');
        }

        const data = (await response.json()) as unknown as DatabaseSubforum;

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
        setMembers(data.members?.join('\n') || '');
        setIsPublic(data.public);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSubforum();
  }, [subforumId, user?.username, navigate]);

  // Validate form inputs
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

    const moderatorsList = moderators
      .split('\n')
      .map(mod => mod.trim())
      .filter(mod => mod !== '');
    if (moderatorsList.length === 0) {
      setModeratorsErr('Must have at least one moderator');
      isValid = false;
    } else {
      setModeratorsErr('');
    }

    // Members are required for private subforums
    if (!isPublic && !members.trim()) {
      setMembersErr('Members are required for private subforums');
      isValid = false;
    } else {
      setMembersErr('');
    }

    return isValid;
  };

  /**
   * Function to update the subforum settings.
   *
   * @returns {void}
   */
  const updateSubforum = async () => {
    if (!validateForm() || !subforumId) return;

    const tagList = tags.split(' ').filter(tag => tag.trim() !== '');
    const rulesList = rules.split('\n').filter(rule => rule.trim() !== '');
    const moderatorsList = moderators
      .split('\n')
      .map(mod => mod.trim())
      .filter(mod => mod !== '');
    const membersList = members
      .split('\n')
      .map(member => member.trim())
      .filter(member => member !== '');

    // Ensure current user is included as a moderator and member
    if (!moderatorsList.includes(user.username)) {
      moderatorsList.push(user.username);
    }
    if (!membersList.includes(user.username)) {
      membersList.push(user.username);
    }

    const updateData: DatabaseUpdateSubforumRequest = {
      title,
      description,
      moderators: moderatorsList,
      members: membersList,
      tags: tagList,
      rules: rulesList,
      public: isPublic,
      updatedAt: new Date(),
    } as DatabaseUpdateSubforumRequest;

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/subforums/${subforumId}`, {
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
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/subforums/${subforumId}`, {
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
    members,
    setMembers,
    isPublic,
    setIsPublic,
    titleErr,
    descriptionErr,
    tagsErr,
    rulesErr,
    moderatorsErr,
    membersErr,
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
