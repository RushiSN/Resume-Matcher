import React from 'react'
import { Container } from 'react-bootstrap';
import Opportunities from '../components/user/Opportunities';
const UserDashboard  = () =>{  
    
  document.title = "Resume Ranker | User Dashboard";
    return (
    <Container className='shadow pt-4 mt-4 justify-content-center '>
        <h1>Welcome {JSON.parse(localStorage.getItem('user')).first_name}</h1>
        <p>
          Thank you for using ResumeRanker
        </p>
        <Opportunities />
    </Container>
    )
}

export default UserDashboard;