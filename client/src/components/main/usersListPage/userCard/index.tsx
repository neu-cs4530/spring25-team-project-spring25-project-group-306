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
const UserCardView = (props: UserProps) => {
  const { user, handleUserCardViewClickHandler } = props;

  let karmaClass = 'karma-grey';
  if (user.karma && user.karma < 0) {
    karmaClass = 'karma-red';
  } else if (user.karma && user.karma > 0) {
    karmaClass = 'karma-green';
  }

  return (
    <div className='user right_padding' onClick={() => handleUserCardViewClickHandler(user)}>
      <div className='user_mid'>
        <div className='userUsername'>{user.username}</div>
      </div>
      <div className={karmaClass}>
        <div>{user.karma ?? 0} karma</div>
      </div>
      <div className='userStats'>
        <div>joined {new Date(user.dateJoined).toUTCString()}</div>
      </div>
    </div>
  );
};

export default UserCardView;
