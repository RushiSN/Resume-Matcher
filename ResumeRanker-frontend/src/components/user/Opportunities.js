import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Card, Spinner } from 'react-bootstrap';
import '../../static/css/Opportunities.css';

const Opportunities = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:8000'; 

        const response = await axios.get(`${baseURL}/user/jobs/`);
        setJobs(response.data);
      } catch (err) {
        setError('Failed to load job opportunities.');
      }
      setLoading(false);
    };

    fetchJobs();
  }, []);

  if (loading) {
    return <div className="text-center"><Spinner animation="border" /></div>;
  }

  if (error) {
    return <div className="text-center text-danger">{error}</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">Latest Opportunities</h2>
      <div className="row">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div key={job.job_id} className="col-md-4 mb-4">
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>{job.title}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">{job.company}</Card.Subtitle>
                  <Card.Text>{job.description.substring(0, 100)}...</Card.Text>
                  <Link to={`/apply/${job.job_id}`} className="btn btn-primary">Apply Now</Link>
                </Card.Body>
              </Card>
            </div>
          ))
        ) : (
          <p className="text-center">No job opportunities available.</p>
        )}
      </div>
    </div>
  );
};

export default Opportunities;