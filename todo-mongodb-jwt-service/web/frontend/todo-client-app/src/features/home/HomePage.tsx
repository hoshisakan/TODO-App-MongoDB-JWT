import LoginForm from './LoginForm';
import { StyledHomePageOutsideDiv } from './styles/StyledComponents';
// import './styles/style.css';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../app/stores/store';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import RegisterForm from './RegisterForm';
import RegisterSuccessNavigatePage from './RegisterSuccessNavigatePage';
import NotFound from '../errors/NotFounds';


export default observer(function HomePage() {
    const {
        userStore: { isLoggedIn, user },
    } = useStore();
    // const navigate = useNavigate();
    // const location = useLocation();

    // const NotLoggedNavigationRoutes = () => {
    //     switch (location.pathname) {
    //         case '/sign-up':
    //             return <RegisterForm />;
    //         case '/sign-up-success':
    //             return <RegisterSuccessNavigatePage />;
    //         case '/':
    //             return <LoginForm />;
    //         default:
    //             return <NotFound />
    //     }
    // };

    return (
        <StyledHomePageOutsideDiv>
            {isLoggedIn ? (
                <>
                    <h1 style={{ color: 'white' }}>Welcome {user?.username} !&nbsp;</h1>
                    <a href="/todo" className="btn btn-primary btn-lg" role="button" aria-disabled="true">
                        Forward Todo List Page
                    </a>
                </>
            ) : (
                <LoginForm />
            )}
        </StyledHomePageOutsideDiv>
    );
});
