import { useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import './App.css';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

import {
  initializeCSRF,
  restoreSession,
  selectAuthInitializing,
} from './features/auth/authSlice';


function App() {
  const dispatch = useDispatch();

  const isInitializing = useSelector(
    selectAuthInitializing
  );

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    const initializeApp = async () => {
      try {
        /*
         * Step 1:
         * Get CSRF cookie from Django.
         */
        await dispatch(
          initializeCSRF()
        ).unwrap();


        /*
         * Step 2:
         * Try to restore the user's session.
         *
         * The browser automatically sends the
         * HttpOnly refresh_token cookie.
         */
        await dispatch(
          restoreSession()
        ).unwrap();

      } catch (error) {
        /*
         * No refresh cookie means the user is simply
         * not logged in.
         *
         * This is not an application error.
         */
        console.log('No active session.' , error);
      }
    };


    initializeApp();
  }, [dispatch]);


  /*
   * Don't render the application routes until
   * authentication initialization has completed.
   */
  if (isInitializing) {
    return (
      <div>
        Loading...
      </div>
    );
  }


  return (
    <>
      <Routes>
        <Route element={<PublicRoute />} >
        <Route
          path="/"
          element={<Register />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />
        </Route>

       <Route element={<ProtectedRoute />}> <Route path="/dashboard" element={<Dashboard />} /> </Route>
      </Routes>
    </>
  );
}


export default App;