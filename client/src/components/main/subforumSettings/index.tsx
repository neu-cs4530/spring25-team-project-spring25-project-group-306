import React from 'react';
import { useParams } from 'react-router-dom';
import useSubforumSettings from '../../../hooks/useSubforumSettings';
import Form from '../baseComponents/form';
import Input from '../baseComponents/input';
import TextArea from '../baseComponents/textarea';
import './index.css';

const SubforumSettingsPage: React.FC = () => {
  const { subforumId } = useParams<{ subforumId: string }>();
  const {
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
    updateSubforum,
    deleteSubforum,
  } = useSubforumSettings(subforumId);

  if (loading) {
    return <div className='loading'>Loading subforum settings...</div>;
  }

  if (error) {
    return <div className='error'>Error: {error}</div>;
  }

  const handleDelete = () => {
    if (
      window.confirm('Are you sure you want to delete this subforum? This action cannot be undone.')
    ) {
      deleteSubforum();
    }
  };

  return (
    <div className='subforum-settings-container'>
      <h1>Edit Subforum Settings</h1>
      <Form>
        <Input
          title='Subforum Title *'
          hint='Limit title to 100 characters or less'
          id='formTitleInput'
          val={title}
          setState={setTitle}
          err={titleErr}
        />
        <TextArea
          title='Description *'
          hint='Describe the purpose and scope of this subforum'
          id='formDescriptionInput'
          val={description}
          setState={setDescription}
          err={descriptionErr}
        />
        <Input
          title='Tags'
          hint='Add keywords separated by whitespace'
          id='formTagInput'
          val={tags}
          setState={setTags}
          err={tagsErr}
        />
        <TextArea
          title='Rules'
          hint='Add rules for the subforum (one per line)'
          id='formRulesInput'
          val={rules}
          setState={setRules}
          err={rulesErr}
        />
        <TextArea
          title='Moderators *'
          hint='Add moderator usernames (one per line)'
          id='formModeratorsInput'
          val={moderators}
          setState={setModerators}
          err={moderatorsErr}
        />
        <div className='settings-actions'>
          <button className='save-button' onClick={updateSubforum}>
            Save Changes
          </button>
          <button className='delete-button' onClick={handleDelete}>
            Delete Subforum
          </button>
        </div>
      </Form>
    </div>
  );
};

export default SubforumSettingsPage;
