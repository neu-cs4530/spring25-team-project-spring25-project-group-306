import './index.css';
import '../../karma.css';
import { SafeDatabaseUser } from '../../../../types/types';

/**
 * Interface representing the props for the User component.
 *
 * user - The user object containing details about the user.
 * handleUserCardViewClickHandler - The function to handle the click event on the user card.
 */
interface UserProps {
  user: SafeDatabaseUser;
  handleUserCardViewClickHandler: (user: SafeDatabaseUser) => void;
}

/**
 * User component renders the details of a user including its username and dateJoined.
 * Clicking on the component triggers the handleUserPage function,
 * and clicking on a tag triggers the clickTag function.
 *
 * @param user - The user object containing user details.
 */
const UserCardView = ({ user, handleUserCardViewClickHandler }: UserProps) => {
  let karmaClass = 'user-karma';
  if (user.karma && user.karma < 0) {
    karmaClass += ' karma-red';
  } else if (user.karma && user.karma > 0) {
    karmaClass += ' karma-green';
  }

  return (
    <div className='user-card' onClick={() => handleUserCardViewClickHandler(user)}>
      <div className='user-info'>
        <span className='user-name'>{user.username}</span>
        <span className={karmaClass}>{user.karma ?? 0} karma</span>
      </div>
      <div className='user-join-date'>joined {new Date(user.dateJoined).toLocaleDateString()}</div>
    </div>
  );
};

export default UserCardView;
