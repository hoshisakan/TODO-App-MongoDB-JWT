import { Fragment, useEffect, useState } from 'react';
import HomePage from '../../features/home/HomePage';
import { Outlet, useLocation } from 'react-router-dom';
// import HeaderNavbar from './HeaderNavbar';
import { observer } from 'mobx-react-lite';
// import Footer from './Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useStore } from '../stores/store';
import LoadingComponent from './LoadingComponent';
// import { StyledLoginPageOutsideDiv } from './styles/LoadingPageOutsideStyledComponent';
// import RegisterForm from '../../features/home/RegisterForm';
import OtherPage from './OtherPage';
// import './styles/style.css';

function App() {
    const location = useLocation();
    const {
        userStore: { setApploaded, verifyToken, appLoaded },
    } = useStore();
    // const UnverifiedPage = ['/', '/sign-up', '/forget-password', '/sign-up-success'];
    // const VerifiedPage = ['/todo'];
    // const UnverifiedPage = ['/'];

    useEffect(() => {
        // alert(process.env.REACT_APP_API_URL);
        verifyToken('access')
            .finally(() => {
                setApploaded();
            })
            .catch((err) => {
                // console.error(err.response.data.message);
                // alert(err);
            });
    }, [setApploaded, verifyToken]);

    if (!appLoaded) {
        return <LoadingComponent content="Loading app..." />;
    }

    // const CheckLocationPathName = () => {
    //     // console.log(`CheckLocationPathName: ${location.pathname}`);
    //     return VerifiedPage.indexOf(location.pathname) === -1;
    //     // return UnverifiedPage.indexOf(location.pathname) !== -1;
    // };

    // const HandleAppNavigation = () => {
    //     const currentPathName = location.pathname;

    //     if (currentPathName === '/') {
    //         return <HomePage />;
    //     } else if (currentPathName in ['sign-up', 'sign-up-success']) {
    //         return <HomePage />;
    //     } else if (currentPathName === 'todo') {
    //         return (
    //             <Fragment>
    //                 <HeaderNavbar navbarName={'Todo'} />
    //                 <Outlet />
    //             </Fragment>
    //         );
    //     }
    // };

    return (
        <Fragment>
            <ToastContainer position="bottom-right" hideProgressBar theme="colored" />
            {/* {CheckLocationPathName() ? (
                <HomePage />
            ) : (
                <Fragment>
                    <HeaderNavbar navbarName={'Todo'} />
                    <Outlet />
                </Fragment>
            )} */}
            {location.pathname === '/' ? <HomePage /> : <OtherPage />}
        </Fragment>
    );
}

export default observer(App);
