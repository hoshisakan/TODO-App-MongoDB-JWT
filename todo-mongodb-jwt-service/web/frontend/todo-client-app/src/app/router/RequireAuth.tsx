import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useStore } from '../stores/store';

export default function RequireAuth() {
    const {
        userStore: { isLoggedIn },
    } = useStore();;
    const location = useLocation();

    if (!isLoggedIn) {
        return <Navigate to="/sign-in" state={{ from: location }} />;
    } else {
        return <Outlet />;
    }
}
