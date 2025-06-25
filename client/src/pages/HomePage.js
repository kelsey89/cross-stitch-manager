// client/src/pages/HomePage.js
import React from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function HomePage({ projects }) {
  if (!projects.length) {
    return <p>No projects yet. <Link to="/projects">Create one</Link>.</p>;
  }
  return (
    <>
      <h2>My Projects Gallery</h2>
      <Row xs={1} sm={2} md={3} className="g-3">
        {projects.map(p => (
          <Col key={p.id}>
            <Card>
              <Card.Body>
                <Card.Title>{p.name}</Card.Title>
                <Card.Text>{p.description || '—'}</Card.Text>
                <Button as={Link} to={`/projects/${p.id}`} size="sm">
                  Details
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}
