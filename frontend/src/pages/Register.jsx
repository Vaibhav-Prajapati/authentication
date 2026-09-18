import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../features/auth/authSlice';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
  });

  const [validationError, setValidationError] = useState('');

  const { isLoading, error } = useSelector((state) => state.auth);

  const getFieldError = (field) => {
    if (!error?.[field]) {
      return null;
    }

    if (Array.isArray(error[field])) {
      return error[field][0];
    }

    return error[field];
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { email, password, password2, first_name, last_name } = formData;

    if (!email) {
      setValidationError('Email is required');
      return;
    }

    if (!password) {
      setValidationError('Password is required');
      return;
    }

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return;
    }

    if (!password2) {
      setValidationError('Confirm password is required');
      return;
    }

    if (password !== password2) {
      setValidationError('Passwords do not match');
      return;
    }

    const registrationData = {
      email,
      password,
      first_name,
      last_name,
    };

    try {
      await dispatch(registerUser(registrationData)).unwrap();

      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setValidationError('');
  };

  return (
    <div>
      <h2>Create Account</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="first_name">First Name</label>

          <input
            id="first_name"
            type="text"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
          />

          {getFieldError('first_name') && (
            <div>{getFieldError('first_name')}</div>
          )}
        </div>

        <div>
          <label htmlFor="last_name">Last Name</label>

          <input
            id="last_name"
            type="text"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
          />

          {getFieldError('last_name') && (
            <div>{getFieldError('last_name')}</div>
          )}
        </div>

        <div>
          <label htmlFor="email">Email</label>

          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />

          {getFieldError('email') && (
            <div>{getFieldError('email')}</div>
          )}
        </div>

        <div>
          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />

          {getFieldError('password') && (
            <div>{getFieldError('password')}</div>
          )}
        </div>

        <div>
          <label htmlFor="password2">Confirm Password</label>

          <input
            id="password2"
            type="password"
            name="password2"
            value={formData.password2}
            onChange={handleChange}
          />
        </div>

        {validationError && (
          <div>{validationError}</div>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
};

export default Register;