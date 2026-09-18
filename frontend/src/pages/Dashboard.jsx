
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import {
  logoutUser,
  selectUser,
} from '../features/auth/authSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectUser);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();

      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const displayName =
    user?.first_name ||
    user?.username ||
    user?.email ||
    'User';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              MyApp
            </h1>
          </div>

          {/* User / Logout */}
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-gray-900">
                {displayName}
              </p>

              {user?.email && (
                <p className="text-xs text-gray-500">
                  {user.email}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="
                rounded-lg border border-gray-300
                bg-white px-3.5 py-2
                text-sm font-medium text-gray-700
                transition-colors
                hover:bg-gray-50
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:ring-offset-2
              "
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Dashboard
          </h2>

          <p className="mt-1 text-sm text-gray-600">
            Welcome back, {displayName}.
          </p>
        </section>

        {/* Content */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Account Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <span className="text-sm font-semibold text-blue-600">
                U
              </span>
            </div>

            <h3 className="text-base font-semibold text-gray-900">
              Account
            </h3>

            <p className="mt-1 text-sm leading-6 text-gray-600">
              Manage your account information and preferences.
            </p>
          </div>

          {/* Authentication Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
              <span className="text-sm font-semibold text-green-600">
                ✓
              </span>
            </div>

            <h3 className="text-base font-semibold text-gray-900">
              Authentication
            </h3>

            <p className="mt-1 text-sm leading-6 text-gray-600">
              Your account is currently authenticated.
            </p>
          </div>

          {/* Profile Card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
              <span className="text-sm font-semibold text-purple-600">
                P
              </span>
            </div>

            <h3 className="text-base font-semibold text-gray-900">
              Profile
            </h3>

            <p className="mt-1 text-sm leading-6 text-gray-600">
              View and update your profile details.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;

