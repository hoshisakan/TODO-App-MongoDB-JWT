import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function RequireAuth() {
    const isLoggedIn = false;
    const location = useLocation();

    if (isLoggedIn) {
        return <Navigate to="/" state={{ from: location }} />;
    }
    return <Outlet />;
}
