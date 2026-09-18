
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

import { registerUser } from '../features/auth/authSlice';

import Button from '../components/ui/Buttons';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';

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

    const {
      email,
      password,
      password2,
      first_name,
      last_name,
    } = formData;

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
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:py-16">
      <div className="mx-auto flex w-full max-w-md flex-col justify-center">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            Sign up to get started.
          </p>
        </div>

        {/* Registration Card */}
        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Server-side general error */}
            {error?.detail && (
              <Alert type="error">
                {Array.isArray(error.detail)
                  ? error.detail[0]
                  : error.detail}
              </Alert>
            )}

            {/* Client-side validation error */}
            {validationError && (
              <Alert type="error">
                {validationError}
              </Alert>
            )}

            {/* Name fields */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input
                id="first_name"
                name="first_name"
                type="text"
                label="First Name"
                placeholder="John"
                value={formData.first_name}
                onChange={handleChange}
                autoComplete="given-name"
                error={getFieldError('first_name')}
              />

              <Input
                id="last_name"
                name="last_name"
                type="text"
                label="Last Name"
                placeholder="Doe"
                value={formData.last_name}
                onChange={handleChange}
                autoComplete="family-name"
                error={getFieldError('last_name')}
              />
            </div>

            {/* Email */}
            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              error={getFieldError('email')}
            />

            {/* Password */}
            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              error={getFieldError('password')}
            />

            {/* Confirm Password */}
            <Input
              id="password2"
              name="password2"
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.password2}
              onChange={handleChange}
              autoComplete="new-password"
            />

            {/* Submit */}
            <Button
              type="submit"
              loading={isLoading}
            >
              Create Account
            </Button>
          </form>

          {/* Login Link */}
          <div className="mt-6 border-t border-gray-100 pt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-blue-600 transition-colors hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </main>
  );
};

export default Register;

