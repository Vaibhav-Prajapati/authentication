
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import {
  loginUser,
  clearAuthError,
} from '../features/auth/authSlice';

import Button from '../components/ui/Buttons';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';

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
      console.error(error)
      // Login error is already stored in Redux.
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
      return Array.isArray(error.detail)
        ? error.detail[0]
        : error.detail;
    }

    if (error.non_field_errors) {
      return Array.isArray(error.non_field_errors)
        ? error.non_field_errors[0]
        : error.non_field_errors;
    }

    return 'Login failed. Please check your credentials.';
  };

  const generalError = getGeneralError();

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:py-16">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome back
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue.
          </p>
        </div>

        {/* Login Card */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* General API error */}
            {generalError && (
              <Alert type="error">
                {generalError}
              </Alert>
            )}

            {/* Client-side validation */}
            {validationError && (
              <Alert type="error">
                {validationError}
              </Alert>
            )}

            {/* Email */}
            <Input
              id="email"
              type="email"
              name="email"
              label="Email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="email"
              error={getFieldError('email')}
            />

            {/* Password */}
            <Input
              id="password"
              type="password"
              name="password"
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="current-password"
              error={getFieldError('password')}
            />

            {/* Submit */}
            <Button
              type="submit"
              loading={isLoading}
            >
              Login
            </Button>
          </form>

          {/* Register */}
          <div className="mt-6 border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-blue-600 transition-colors hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Create an account
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
};

export default Login;

