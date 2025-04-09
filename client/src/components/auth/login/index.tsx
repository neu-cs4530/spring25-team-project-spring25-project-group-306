import React from 'react';
import './index.css';
import { Link } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';

/**
 * Renders a login form with username and password inputs, password visibility toggle,
 * error handling, and a link to the signup page.
 *
 */
const Login = () => {
  const {
    username,
    password,
    showPassword,
    err,
    handleSubmit,
    handleInputChange,
    togglePasswordVisibility,
  } = useAuth('login');

  return (
    <div className='container'>
      <div className='login-card'>
        <h2>Welcome to StackUnderflow! 💻</h2>
        <h3>Please login to continue.</h3>
        <form onSubmit={handleSubmit}>
          <div className='input-group'>
            <h4>Username</h4>
            <input
              type='text'
              value={username}
              onChange={event => handleInputChange(event, 'username')}
              placeholder='Enter your username'
              required
              className='input-text'
              id='username-input'
            />
          </div>
          <div className='input-group'>
            <h4>Password</h4>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={event => handleInputChange(event, 'password')}
              placeholder='Enter your password'
              required
              className='input-text'
              id='password-input'
            />
            <div className='show-password'>
              <input
                type='checkbox'
                id='showPasswordToggle'
                checked={showPassword}
                onChange={togglePasswordVisibility}
              />
              <label htmlFor='showPasswordToggle'>Show Password</label>
            </div>
          </div>
          <button type='submit' className='login-button'>
            Log In
          </button>
        </form>
        {err && <p className='error-message'>{err}</p>}
        <Link to='/signup' className='signup-link'>
          Don&apos;t have an account? Sign up here.
        </Link>
      </div>
    </div>
  );
};

export default Login;
