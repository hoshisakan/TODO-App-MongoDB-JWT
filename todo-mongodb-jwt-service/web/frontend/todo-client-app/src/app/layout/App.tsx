import { Fragment, useEffect } from 'react';
import HomePage from '../../features/home/HomePage';
import { useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useStore } from '../stores/store';
import LoadingComponent from './LoadingComponent';
import OtherPage from '../../features/home/OtherPage';

function App() {
    const location = useLocation();
    const {
        userStore: { setApploaded, verifyToken, appLoaded },
    } = useStore();

    useEffect(() => {
        const loadPage = () => {
            try {
                const refreshTokenRouteList = [
                    '/todo', '/'
                ];
                const currentPath = location.pathname;
                if (refreshTokenRouteList.includes(currentPath)) {
                    verifyToken('access')
                        .finally(() => {
                            setApploaded();
                        })
                        .catch((err) => {
                            // console.error(err.response.data.message);
                            // alert(err);
                        });
                // const notRefreshTokenList = ['/not-found', '/sign-up', '/sign-up-success', '/verify-email', '/sign-in'];
                // const currentPath = location.pathname;
                // if (!notRefreshTokenList.includes(currentPath)) {
                //     verifyToken('access')
                //         .finally(() => {
                //             setApploaded();
                //         })
                //         .catch((err) => {
                //             // console.error(err.response.data.message);
                //             // alert(err);
                //         });
                } else {
                    setApploaded();
                }
            } catch (err: any) {
                console.log(err.message);
            }
        };
        loadPage();
    }, [location.pathname, setApploaded, verifyToken]);

    if (!appLoaded) {
        return <LoadingComponent content="Loading app..." />;
    }

    return (
        <Fragment>
            <ToastContainer position="bottom-right" hideProgressBar theme="colored" />
            {location.pathname === '/' ? <HomePage /> : <OtherPage />}
        </Fragment>
    );
}

export default observer(App);
