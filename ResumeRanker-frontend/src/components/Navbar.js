import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import '../static/css/navbar.css';
import RecruiterNavbar from './Recruiter/RecruiterNavbar';
import UserNavbar from './user/UserNavbar';

const NavigationBar = () => {
  const [recruiterAuth, setRecruiterAuth] = useState(false);
  const [userAuth, setUserAuth] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setRecruiterAuth(!!localStorage.getItem('recruiter'));
    setUserAuth(!!localStorage.getItem('user'));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    if (recruiterAuth) {
      localStorage.removeItem('recruiter');
      setRecruiterAuth(false);
      navigate('/recruiter-login');
    } else if (userAuth) {
      localStorage.removeItem('user');
      setUserAuth(false);
      navigate('/user-login');
    }
  };

  return (
    recruiterAuth ? <RecruiterNavbar onLogout={handleLogout} /> :
    userAuth ? <UserNavbar onLogout={handleLogout} /> :
    <Navbar bg="dark" variant="dark" expand="sm" className={isSticky ? 'sticky' : ''}>
      <Container>
        <Navbar.Brand as={Link} to="/">Resume Ranker</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <Nav.Link href="/#home">Home</Nav.Link>
            <Nav.Link href="/#about">About Us</Nav.Link>
            <Nav.Link href="/#services">Services</Nav.Link>
            <Nav.Link href="/#contact">Contact</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>      
    </Navbar>
  );
};

export default NavigationBar;