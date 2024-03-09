import { observer } from 'mobx-react-lite';
import { useStore } from '../../app/stores/store';
import HeaderNavbar from '../../app/layout/HeaderNavbar';
import { Outlet, useLocation } from 'react-router-dom';
import { Fragment } from 'react';
import { StyledHomePageOutsideDiv } from './styles/StyledComponents';

export default observer(function OtherPage() {
    const {
        userStore: { isLoggedIn },
    } = useStore();

    const location = useLocation();

    const exceptionRouteList = [
        '/sign-up-success',
        '/not-found',
        '/verify-email',
        '/reset-password',
        '/reset-password-success',
    ];

    const notLoggedNavigationRoutes = () => {
        return exceptionRouteList.indexOf(location.pathname) !== -1;
    };

    return (
        <Fragment>
            {isLoggedIn || notLoggedNavigationRoutes() ? (
                <Fragment>
                    <div style={{ backgroundColor: '#f0f0f0', height: '100vh' }}>
                        <HeaderNavbar navbarName={'Todo'} />
                        <Outlet />
                    </div>
                </Fragment>
            ) : (
                <Fragment>
                    <StyledHomePageOutsideDiv>
                        <Outlet />
                    </StyledHomePageOutsideDiv>
                </Fragment>
            )}
        </Fragment>
    );
});
