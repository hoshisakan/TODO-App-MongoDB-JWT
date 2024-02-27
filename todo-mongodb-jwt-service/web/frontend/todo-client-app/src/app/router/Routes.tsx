import { RouteObject, createBrowserRouter } from 'react-router-dom';
import App from '../layout/App';
import NotFound from '../../features/errors/NotFounds';
import TestLayoutLoading from '../../features/test/TestLayoutLoading';
import RequireAuth from './RequireAuth';
import TestLayoutLoadingSec from '../../features/test/TestLayoutLoadingSec';
import TodoDashboard from '../../features/todos/TodoDashboard';
import RegisterForm from '../../features/home/RegisterForm';
import RegisterSuccessNavigatePage from '../../features/home/RegisterSuccessNavigatePage';

export const routes: RouteObject[] = [
    {
        path: '/',
        element: <App />,
        children: [
            {
                element: <RequireAuth />,
                children: [
                    {
                        path: 'testLayoutLoading',
                        element: <TestLayoutLoading />,
                    },

                    {
                        path: 'testLayoutLoadingSec',
                        element: <TestLayoutLoadingSec />,
                    },
                    {
                        path: 'todo',
                        element: <TodoDashboard />,
                    },
                ],
            },
            // {
            //     path: 'not-found',
            //     element: <NotFound />,
            // },
            {
                path: 'sign-up',
                element: <RegisterForm />,
            },
            {
                path: 'sign-up-success',
                element: <RegisterSuccessNavigatePage />,
            },
        ],
    },
];

export const router = createBrowserRouter(routes);
