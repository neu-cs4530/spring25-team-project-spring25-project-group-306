import React from 'react';
import './index.css';
import { useNavigate } from 'react-router-dom';
import UserCardView from './userCard';
import useUsersListPage from '../../../hooks/useUsersListPage';
import { SafeDatabaseUser } from '../../../types/types';

/**
 * Interface representing the props for the UsersListPage component.
 * handleUserSelect - The function to handle the click event on the user card.
 */
interface UserListPageProps {
  handleUserSelect?: (user: SafeDatabaseUser) => void;
}

/**
 * UsersListPage component renders a page displaying a list of users
 * based on search content filtering.
 * It includes a header with a search bar.
 */
const UsersListPage = (props: UserListPageProps) => {
  const { userList } = useUsersListPage();
  const { handleUserSelect = null } = props;
  const navigate = useNavigate();

  /**
   * Handles the click event on the user card.
   * If handleUserSelect is provided, it calls the handleUserSelect function.
   * Otherwise, it navigates to the user's profile page.
   */
  const handleUserCardViewClickHandler = (user: SafeDatabaseUser): void => {
    if (handleUserSelect) {
      handleUserSelect(user);
    } else if (user.username) {
      navigate(`/user/${user.username}`);
    }
  };

  /**
   * Sorts users by karma in descending order.
   */
  const sortedUserList = [...userList].sort((a, b) => (b.karma || 0) - (a.karma || 0));

  return (
    <div className='user-card-container'>
      <div id='users_list' className='users_list'>
        {sortedUserList.map(user => (
          <UserCardView
            user={user}
            key={user.username}
            handleUserCardViewClickHandler={handleUserCardViewClickHandler}
          />
        ))}
      </div>
      {(!sortedUserList.length || sortedUserList.length === 0) && (
        <div className='bold_title right_padding'>No Users Found</div>
      )}
    </div>
  );
};

export default UsersListPage;
