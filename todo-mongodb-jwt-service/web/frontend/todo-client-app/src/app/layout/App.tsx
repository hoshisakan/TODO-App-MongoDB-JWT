import { Fragment } from 'react';
import HomePage from '../../features/home/HomePage';
import { Outlet, useLocation } from 'react-router-dom';
import HeaderNavbar from './HeaderNavbar';
// import Footer from './Footer';

function App() {
    const location = useLocation();

    return (
        <Fragment>
            {location.pathname === '/' ? (
                <HomePage />
            ) : (
                <>
                    <HeaderNavbar navbarName={'Todo'} />
                    {/* <SideNavigation>
                        <Outlet />
                    </SideNavigation> */}
                    {/* <SideNavigation children={<Outlet />} /> */}
                    <Outlet />
                    {/* <Footer /> */}
                </>
            )}
        </Fragment>
    );
}

export default App;
