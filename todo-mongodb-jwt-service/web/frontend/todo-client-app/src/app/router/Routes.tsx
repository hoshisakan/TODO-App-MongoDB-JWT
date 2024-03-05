import { Navigate, RouteObject, createBrowserRouter } from 'react-router-dom';
import App from '../layout/App';
import NotFound from '../../features/errors/NotFounds';
import RequireAuth from './RequireAuth';
import TodoDashboard from '../../features/todos/TodoDashboard';
import RegisterForm from '../../features/home/RegisterForm';
// import LoginForm from '../../features/home/LoginForm';
import RegisterSuccessConfirmPage from '../../features/home/RegisterSuccessConfirmPage';
import VerifyEmaiResultPage from '../../features/home/VerifyEmaiResultPage';
import LoginForm from '../../features/home/LoginForm';

export const routes: RouteObject[] = [
    {
        path: '/',
        element: <App />,
        children: [
            {
                element: <RequireAuth />,
                children: [
                    {
                        path: 'todo',
                        element: <TodoDashboard />,
                    },
                ],
            },
            {
                path: 'not-found',
                element: <NotFound />,
            },
            {
                path: 'sign-in',
                element: <LoginForm />,
            },
            {
                path: 'sign-up',
                element: <RegisterForm />,
            },
            {
                path: 'sign-up-success',
                element: <RegisterSuccessConfirmPage />,
            },
            {
                path: 'verify-email',
                element: <VerifyEmaiResultPage />,
            },
            {
                path: '*',
                element: <Navigate replace to="/not-found" />,
            },
        ],
    },
];

export const router = createBrowserRouter(routes);
