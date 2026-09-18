import { useSelector } from 'react-redux';
import { Navigate,  Outlet} from 'react-router-dom';

const PublicRoute = () => {

    const {isAuthenticated, isLoading} = useSelector(state => state.auth)

    if(isLoading) {
        return <div> Loading... </div>
    }

    if(isAuthenticated) {
        return <Navigate to="/dashboard" />
    }

    return <Outlet />
}
export default PublicRoute