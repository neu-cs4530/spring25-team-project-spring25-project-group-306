import React from 'react';
import './index.css';
import { useNavigate } from 'react-router-dom';
import UserCard from './userCard';
import useUsersListPage from '../../../hooks/useUsersListPage';
import { SafeDatabaseUser } from '../../../types/types';

interface UsersListPageProps {
  handleUserSelect?: (user: SafeDatabaseUser) => void;
}

/**
 * UsersListPage component that displays a list of users.
 * It allows for user selection and navigation to user profiles.
 *
 * @param handleUserSelect Optional callback function to handle user selection.
 */
const UsersListPage = ({ handleUserSelect }: UsersListPageProps) => {
  const { userList } = useUsersListPage();
  const navigate = useNavigate();

  const handleUserCardClick = (user: SafeDatabaseUser) => {
    if (handleUserSelect) {
      handleUserSelect(user);
    } else if (user.username) {
      navigate(`/user/${user.username}`);
    }
  };

  // Sort users by karma in descending order
  const sortedUsers = [...userList].sort((a, b) => (b.karma || 0) - (a.karma || 0));

  return (
    <div className='right_main'>
      <div className='page-header'>
        <h1 className='page-title'>Users</h1>
      </div>
      <div className='users-grid'>
        {sortedUsers.map((user: SafeDatabaseUser) => (
          <UserCard
            key={user.username}
            user={user}
            handleUserCardViewClickHandler={handleUserCardClick}
          />
        ))}
      </div>
      {sortedUsers.length === 0 && <div className='bold_title'>No Users Found</div>}
    </div>
  );
};

export default UsersListPage;
