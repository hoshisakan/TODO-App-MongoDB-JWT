import LoginForm from './LoginForm';
import { StyledLoginPageOutsideDiv } from './styles/StyledComponents';
// import './styles/style.css';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../app/stores/store';
import { useLocation } from 'react-router-dom';
import RegisterForm from './RegisterForm';
import RegisterSuccessNavigatePage from './RegisterSuccessNavigatePage';

export default observer(function HomePage() {
    const {
        userStore: { isLoggedIn, user },
    } = useStore();

    const location = useLocation();

    const NotLoggedNavigationRoutes = () => {
        switch (location.pathname) {
            case '/sign-up':
                return <RegisterForm />;
            case '/sign-up-success':
                return <RegisterSuccessNavigatePage />;
            default:
                return <LoginForm />;
        }
    };

    return (
        <StyledLoginPageOutsideDiv>
            {isLoggedIn ? (
                <>
                    <h1 style={{ color: 'white' }}>Welcome {user?.username} !&nbsp;</h1>
                    <a href="/todo" className="btn btn-primary btn-lg" role="button" aria-disabled="true">
                        Forward Todo List Page
                    </a>
                </>
            ) : (
                <NotLoggedNavigationRoutes />
            )}
        </StyledLoginPageOutsideDiv>
    );
});
