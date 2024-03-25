/* eslint-disable jsx-a11y/anchor-is-valid */
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores/store';
import { UserLogout } from '../models/User';
import { StyledIcon } from './styles/StyledComponents';

interface Props {
    navbarName: string;
}

const HeaderNavbar = observer(({ navbarName }: Props) => {
    const {
        userStore: { user, logout, isLoggedIn },
    } = useStore();

    const handleLoginout = () => {
        logout();
    };

    return (
        <nav className="navbar navbar-expand-lg" style={{ backgroundColor: '#3399ff' }}>
            <div className="container-fluid">
                <a className="navbar-brand" href="/todo" style={{ color: 'white', fontWeight: 'bold' }}>
                    {navbarName}
                </a>
                {isLoggedIn && (
                    <>
                        <div>
                            <button
                                className="navbar-toggler"
                                type="button"
                                data-toggle="collapse"
                                data-target="#navbarTogglerDemo03"
                                aria-controls="navbarTogglerDemo03"
                                aria-expanded="false"
                                aria-label="Toggle navigation"
                            >
                                <span className="navbar-toggler-icon"></span>
                            </button>
                        </div>
                        <div>
                            <div className="collapse navbar-collapse" id="navbarTogglerDemo03">
                                <div className="navbar-nav ms-auto">
                                    <li className="nav-item">
                                        <span className="nav-link" style={{ color: 'white', fontWeight: 'bold' }}>
                                            Hi {user?.username} !
                                        </span>
                                    </li>
                                    <li className="nav-item">
                                        <a
                                            className="nav-link active"
                                            aria-current="page"
                                            href="/"
                                            style={{ color: 'white', fontWeight: 'bold' }}
                                        >
                                            Home
                                        </a>
                                    </li>
                                    <li className="nav-item dropdown">
                                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                        <a
                                            className="nav-link dropdown-toggle"
                                            // href="#"
                                            id="navbarDropdown"
                                            role="button"
                                            data-toggle="dropdown"
                                            aria-haspopup="true"
                                            aria-expanded="false"
                                        >
                                            <StyledIcon className="bi bi-person-fill h4" />
                                        </a>
                                        <div
                                            className="dropdown-menu"
                                            aria-labelledby="navbarDropdown"
                                            style={{ right: 0, left: 'auto' }}
                                        >
                                            <a className="dropdown-item" href="/profile" style={{ fontWeight: 'bold' }}>
                                                Profile
                                            </a>
                                            <a
                                                className="dropdown-item"
                                                onClick={handleLoginout}
                                                style={{ fontWeight: 'bold' }}
                                            >
                                                Logout
                                            </a>
                                        </div>
                                    </li>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </nav>
    );
});

export default HeaderNavbar;
