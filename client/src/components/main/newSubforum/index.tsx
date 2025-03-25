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
    rules,
    setRules,
    titleErr,
    descriptionErr,
    tagsErr,
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
