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

interface Props {
    navbarName: string;
}

const HeaderNavbar = ({ navbarName }: Props) => {
    return (
        <StyledNavbar expand="md" fixed="top">
            <Container fluid>
                <StyledNavBrand href="/todo">{navbarName}</StyledNavBrand>
                <StyledNavbarToggler aria-controls="offcanvasNavbar-expand-navbar-toggle" />
                <StyledOffcanvas
                    id="offcanvasNavbar-expand-navbar"
                    aria-labelledby={`offcanvasNavbarLabel-expand-navbar`}
                    className="offcanvas offcanvas-top w-100 h-50"
                    // style={{ backgroundColor: '#3399ff', fontWeight: 'bold', color: 'white' }}
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
                                <StyledNavDropdownItem href="/logout">Logout</StyledNavDropdownItem>
                            </StyledNavDropdown>
                        </Nav>
                    </Offcanvas.Body>
                </StyledOffcanvas>
            </Container>
        </StyledNavbar>
    );
};

export default HeaderNavbar;
