import { Container, Nav, Offcanvas } from 'react-bootstrap';
import {
    StyledNavbar,
    StyledNavBrand,
    StyledNavbarToggler,
    StyledOffcanvas,
    StyleOffcanvasTitle,
    StyledNavLink,
    StyledNavDropdown,
    StyledIcon,
    StyledNavDropdownItem,
} from './styles/StyledComponents';
import { observer } from 'mobx-react-lite';
import { useStore } from '../stores/store';
import { UserLogout } from '../models/User';

interface Props {
    navbarName: string;
}

const HeaderNavbar = observer(({ navbarName }: Props) => {
    const {
        userStore: { user, logout },
    } = useStore();

    const handleLoginout = () => {
        const userLogout: UserLogout = {
            username: user?.username || '',
            email: user?.email || '',
        };
        logout(userLogout);
    };

    return (
        <StyledNavbar expand="md" fixed="top">
            <Container fluid>
                <StyledNavBrand href="/todo">{navbarName}</StyledNavBrand>
                <StyledNavbarToggler aria-controls="offcanvasNavbar-expand-navbar-toggle" />
                <StyledOffcanvas
                    id="offcanvasNavbar-expand-navbar"
                    aria-labelledby={`offcanvasNavbarLabel-expand-navbar`}
                    className="offcanvas offcanvas-top w-100 h-50"
                    placement="end"
                >
                    <Offcanvas.Header closeButton>
                        <StyleOffcanvasTitle id="offcanvasNavbarLabel-expand-navbar">{navbarName}</StyleOffcanvasTitle>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <Nav className="ms-auto">
                            <StyledNavLink href="/">Home</StyledNavLink>
                            <StyledNavDropdown
                                title={
                                    <>
                                        <StyledIcon className="bi bi-person-fill h4"></StyledIcon>
                                    </>
                                }
                                id="offcanvasNavbarDropdown-expand-navbar"
                                align="end"
                            >
                                <StyledNavDropdownItem href="/profile">Profile</StyledNavDropdownItem>
                                {/* <StyledNavDropdownItem href="/logout">Logout</StyledNavDropdownItem> */}
                                <StyledNavDropdownItem onClick={handleLoginout}>Logout</StyledNavDropdownItem>
                            </StyledNavDropdown>
                        </Nav>
                    </Offcanvas.Body>
                </StyledOffcanvas>
            </Container>
        </StyledNavbar>
    );
});

export default HeaderNavbar;
