import { Fragment, useEffect } from 'react';
import HomePage from '../../features/home/HomePage';
import { useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useStore } from '../stores/store';
import LoadingComponent from './LoadingComponent';
import OtherPage from '../../features/home/OtherPage';

function App() {
    const location = useLocation();
    const {
        userStore: { setApploaded, verifyToken, appLoaded, refreshToken },
    } = useStore();

    useEffect(() => {
        const loadPage = () => {
            try {
                const refreshTokenRouteList = ['/todo', '/'];
                const currentPath = location.pathname;
                if (refreshTokenRouteList.includes(currentPath)) {
                    verifyToken('access')
                        .catch((err) => {
                            // console.log(err);
                            // refreshToken()
                            //     .then((response) => {
                            //     })
                            //     .catch((err) => {
                            //         console.log(err);
                            //     });
                        })
                        .finally(() => {
                            setApploaded();
                        });
                } else {
                    setApploaded();
                }
            } catch (err: any) {
                console.log(err.message);
            }
        };
        loadPage();
    }, [location.pathname, refreshToken, setApploaded, verifyToken]);

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
