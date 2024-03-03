import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useStore } from '../stores/store';
import NotFound from '../../features/errors/NotFounds';
import RegisterForm from '../../features/home/RegisterForm';
import RegisterSuccessNavigatePage from '../../features/home/RegisterSuccessNavigatePage';
import LoginForm from '../../features/home/LoginForm';

export default function RequireAuth() {
    const {
        userStore: { isLoggedIn },
    } = useStore();
    const location = useLocation();
    
    if (!isLoggedIn) {
        return <Navigate to="/" state={{ from: location }} />;
    } else {
        return <Outlet />;
    }
}
