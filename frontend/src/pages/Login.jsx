import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, clearAuthError } from '../features/auth/authSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isLoading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { email, password } = formData;

    setValidationError('');

    if (!email) {
      setValidationError('Email is required');
      return;
    }

    if (!password) {
      setValidationError('Password is required');
      return;
    }

    try {
      await dispatch(loginUser(formData)).unwrap();

      navigate('/dashboard');
    } catch (error) {
      // Login error is already stored in Redux
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setValidationError('');

    if (error) {
      dispatch(clearAuthError());
    }
  };

  const getFieldError = (field) => {
    if (!error?.[field]) {
      return null;
    }

    if (Array.isArray(error[field])) {
      return error[field][0];
    }

    return error[field];
  };

  const getGeneralError = () => {
    if (!error) {
      return null;
    }

    if (typeof error === 'string') {
      return error;
    }

    if (error.detail) {
      return error.detail;
    }

    if (error.non_field_errors) {
      return Array.isArray(error.non_field_errors)
        ? error.non_field_errors[0]
        : error.non_field_errors;
    }

    return 'Login failed. Please check your credentials.';
  };

  return (
    <div>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>

          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
          />

          {getFieldError('email') && <div>{getFieldError('email')}</div>}
        </div>

        <div>
          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
          />

          {getFieldError('password') && <div>{getFieldError('password')}</div>}
        </div>

        {validationError && <div>{validationError}</div>}

        {getGeneralError() && <div>{getGeneralError()}</div>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div>
        <span>Don't have an account? </span>

        <button type="button" onClick={() => navigate('/register')} disabled={isLoading}>
          Register
        </button>
      </div>
    </div>
  );
};

export default Login;
