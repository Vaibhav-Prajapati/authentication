import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser, selectUser } from '../features/auth/authSlice';

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

  return (
    <div>
      <h2>Dashboard</h2>

      {user && <p>Welcome, {user.email || user.username}</p>}

      <button type="button" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
