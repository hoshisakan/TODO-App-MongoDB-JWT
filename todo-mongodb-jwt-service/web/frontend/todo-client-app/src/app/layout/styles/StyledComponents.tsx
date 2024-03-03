import styled from 'styled-components';
import { Nav, NavDropdown, Navbar, Offcanvas } from 'react-bootstrap';





export const StyledNavbar = styled(Navbar)`
    background-color: #3399ff;
    width: 100%;
    height: 60px;
`;

export const StyledNavLink = styled(Nav.Link)`
    color: white !important;
    font-weight: bold !important;
`;

export const StyledOffcanvas = styled(Navbar.Offcanvas)`
    background-color: #3399ff;
    font-weight: bold;
    color: white;
`;

export const StyleOffcanvasTitle = styled(Offcanvas.Title)`
    font-weight: bold;
    color: white;
`;

export const StyledNavBrand = styled(Navbar.Brand)`
    color: white !important;
    font-weight: bold;
`;

export const StyledNavbarToggler = styled(Navbar.Toggle)`
    color: none;
    border: none;
`;

export const StyledNavDropdown = styled(NavDropdown)`
    width: 15%;
`;

export const StyledNavDropdownItem = styled(NavDropdown.Item)`
    font-weight: bold;
`;

export const StyledIcon = styled.i`
    color: white;
`;
