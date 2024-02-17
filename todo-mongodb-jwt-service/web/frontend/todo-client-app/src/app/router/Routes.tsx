import { RouteObject, createBrowserRouter } from 'react-router-dom';
import App from '../layout/App';
import NotFound from '../../features/errors/NotFounds';
import TestLayoutLoading from '../../features/test/TestLayoutLoading';
import RequireAuth from './RequireAuth';
import TestLayoutLoadingSec from '../../features/test/TestLayoutLoadingSec';
import TodoDashboard from '../../features/todos/TodoDashboard';

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
                        path: 'not-found',
                        element: <NotFound />,
                    },
                    {
                        path: 'testLayoutLoadingSec',
                        element: <TestLayoutLoadingSec />,
                    },
                    {
                        path: 'todo',
                        element: <TodoDashboard />
                    }
                ],
            },
        ],
    },
];

export const router = createBrowserRouter(routes);
