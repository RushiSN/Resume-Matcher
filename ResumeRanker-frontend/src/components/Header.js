import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../static/css/Header.css';
import headerImage from '../static/media/header.png';

const Header = () => {
  return (
    <header id='home' className="header">
      <Container>
        <Row className="align-items-center text-center text-md-start">
          <Col md={6} className="header-image">
            <img src={headerImage} alt="Header" className="img-fluid" />
          </Col>
          <Col md={6} className="header-content">
            <h1 className="header-title">Resume Ranker</h1>
            <p className="header-subtitle">Connecting Top Talent with Exceptional Opportunities</p>
            <div className="cta-buttons">
              <Button variant="primary" as={Link} to="/user-login" className="cta-button">Job Seeker</Button>
              <Button variant="secondary" as={Link} to="/recruiter-login" className="cta-button">Recruiter</Button>
            </div>
          </Col>
        </Row>
      </Container>
    </header>
  );
};

export default Header;
