// import './styles/style.css';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../app/stores/store';
import HeaderNavbar from './HeaderNavbar';
import { Outlet } from 'react-router-dom';
import { Fragment } from 'react';
import { StyledHomePageOutsideDiv } from '../../features/home/styles/StyledComponents';

export default observer(function OtherPage() {
    const {
        userStore: { isLoggedIn, user },
    } = useStore();

    return (
        <Fragment>
            {isLoggedIn ? (
                <Fragment>
                    <HeaderNavbar navbarName={'Todo'} />
                    <Outlet />
                </Fragment>
            ) : (
                <Fragment>
                    <StyledHomePageOutsideDiv>
                        <Outlet />
                    </StyledHomePageOutsideDiv>
                </Fragment>
            )}
            ;
        </Fragment>
    );
});
