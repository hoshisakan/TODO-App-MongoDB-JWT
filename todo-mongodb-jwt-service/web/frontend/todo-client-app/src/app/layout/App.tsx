import { Fragment, useEffect, useState } from 'react';
import HomePage from '../../features/home/HomePage';
import { Outlet, useLocation } from 'react-router-dom';
import HeaderNavbar from './HeaderNavbar';
import { observer } from 'mobx-react-lite';
// import Footer from './Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useStore } from '../stores/store';
import LoadingComponent from './LoadingComponent';
// import './styles/style.css';

function App() {
    const location = useLocation();
    const {
        userStore: { setApploaded, verifyToken, appLoaded },
    } = useStore();
    const UnverifiedPage = ['/', '/sign-up', '/forget-password', '/sign-up-success'];

    useEffect(() => {
        verifyToken('access')
            .finally(() => {
                setApploaded();
            })
            .catch((err) => {
                console.error(err.response.data.message);
            });
    }, [setApploaded, verifyToken]);

    if (!appLoaded) {
        return <LoadingComponent content="Loading app..." />;
    }

    const CheckLocationPathName = () => {
        console.log(`CheckLocationPathName: ${location.pathname}`);
        return UnverifiedPage.indexOf(location.pathname) !== -1;
    };

    return (
        <Fragment>
            <ToastContainer position="bottom-right" hideProgressBar theme="colored" />
            {CheckLocationPathName() ? (
                <HomePage />
            ) : (
                <>
                    <HeaderNavbar navbarName={'Todo'} />
                    <Outlet />
                </>
            )}
        </Fragment>
    );
}

export default observer(App);
