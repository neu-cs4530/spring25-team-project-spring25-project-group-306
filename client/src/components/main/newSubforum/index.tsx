import React from 'react';
import useNewSubforum from '../../../hooks/useNewSubforum';
import Form from '../baseComponents/form';
import Input from '../baseComponents/input';
import TextArea from '../baseComponents/textarea';
import './index.css';

const NewSubforumPage: React.FC = () => {
  const {
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
  } = useNewSubforum();

  return (
    <div className='new-subforum-container'>
      <h1>Create New Subforum</h1>
      {error && <div className='error'>{error}</div>}
      <Form>
        <Input
          title='Subforum Title'
          hint='Limit title to 100 characters or less'
          id='formTitleInput'
          val={title}
          setState={setTitle}
          err={titleErr}
          mandatory={true}
        />
        <TextArea
          title='Description'
          hint='Describe the purpose and scope of this subforum (optional)'
          id='formDescriptionInput'
          val={description}
          setState={setDescription}
          err={descriptionErr}
          mandatory={false}
        />
        <Input
          title='Tags'
          hint='Add keywords separated by whitespace (optional)'
          id='formTagInput'
          val={tags}
          setState={setTags}
          err={tagsErr}
          mandatory={false}
        />
        <TextArea
          title='Moderators'
          hint='Add additional moderator usernames (one per line, optional)'
          id='formModeratorsInput'
          val={moderators}
          setState={setModerators}
          err={moderatorsErr}
          mandatory={false}
        />
        <TextArea
          title='Rules'
          hint='Add rules for the subforum (one per line, optional)'
          id='formRulesInput'
          val={rules}
          setState={setRules}
          err={rulesErr}
          mandatory={false}
        />
        <div className='btn_indicator_container'>
          <button className='form_postBtn' onClick={createSubforum}>
            Create Subforum
          </button>
          <div className='mandatory_indicator'>* indicates mandatory fields</div>
        </div>
      </Form>
    </div>
  );
};

export default NewSubforumPage;
