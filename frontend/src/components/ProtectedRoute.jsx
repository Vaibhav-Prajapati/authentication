import { useSelector  } from 'react-redux';
import { Navigate,  Outlet} from 'react-router-dom';

const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useSelector(state => state.auth);

    if (isLoading) { return <div>Loading...</div>; }

    if(!isAuthenticated) {
        return <Navigate to="/login" />
    }
    return <Outlet />;
}

export default ProtectedRoute