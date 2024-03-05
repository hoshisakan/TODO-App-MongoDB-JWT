// import LoginForm from './LoginForm';
import { StyledHomePageOutsideDiv } from './styles/StyledComponents';
// import './styles/style.css';
import { observer } from 'mobx-react-lite';
import { useStore } from '../../app/stores/store';
import { Navigate, useLocation } from 'react-router-dom';

export default observer(function HomePage() {
    const {
        userStore: { isLoggedIn, user },
    } = useStore();
    const location = useLocation();

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
                // <LoginForm />
                <Navigate to="/sign-in" state={{ from: location }} />
            )}
        </StyledHomePageOutsideDiv>
    );
});
