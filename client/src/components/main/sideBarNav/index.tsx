import React, { useState } from 'react';
import './index.css';
import { NavLink, useLocation } from 'react-router-dom';

/**
 * The SideBarNav component has four menu items: "Questions", "Tags", "Messaging", and "Users".
 * It highlights the currently selected item based on the active page and
 * triggers corresponding functions when the menu items are clicked.
 */
const SideBarNav = () => {
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const location = useLocation();

  /**
   * Toggles the visibility of the additional messaging options.
   */
  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  /**
   * Determines if the current path matches the provided path.
   * If it does, it returns a class name to indicate that the option is selected.
   *
   * @param path The path to check against the current location pathname.
   * @returns A string representing the class name for the selected option.
   */
  const isActiveOption = (path: string) =>
    location.pathname === path ? 'message-option-selected ' : '';

  return (
    <div id='sideBarNav' className='sideBarNav'>
      <NavLink
        to='/home'
        id='menu_questions'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}>
        Questions
      </NavLink>
      <NavLink
        to='/tags'
        id='menu_tag'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}>
        Tags
      </NavLink>
      <NavLink
        to='/messaging'
        id='menu_messaging'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}
        onClick={toggleOptions}>
        Messaging
      </NavLink>
      {showOptions && (
        <div className='additional-options'>
          <NavLink
            to='/messaging'
            className={`menu_button message-options ${isActiveOption('/messaging')}`}>
            Global Messages
          </NavLink>
          <NavLink
            to='/messaging/direct-message'
            className={`menu_button message-options ${isActiveOption('/messaging/direct-message')}`}>
            Direct Messages
          </NavLink>
        </div>
      )}
      <NavLink
        to='/users'
        id='menu_users'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}>
        Users
      </NavLink>
      <NavLink
        to='/games'
        id='menu_games'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}>
        Games
      </NavLink>
      <NavLink
        to='/subforums'
        id='menu_subforums'
        className={({ isActive }) => `menu_button ${isActive ? 'menu_selected' : ''}`}>
        Subforums
      </NavLink>
    </div>
  );
};

export default SideBarNav;
