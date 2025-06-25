// client/src/components/ThreadForm.js

import React, { useState } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';

export default function ThreadForm({ onAdd, fetchFn = fetch }) {
  const [code, setCode] = useState('');
  const [threadName, setThreadName] = useState('');
  const [hex, setHex] = useState('#000000');
  const [owned, setOwned] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetchFn('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          name: threadName,
          hex,
          owned
        })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Status ${res.status}`);
      }
      const created = await res.json();
      onAdd({
        id: created.id,
        code,
        name: threadName,
        hex,
        owned
      });
      setCode('');
      setThreadName('');
      setHex('#000000');
      setOwned(false);
    } catch (err) {
      console.error(err);
      setError('Failed to add thread');
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-4">
      <h5>Add a New Thread</h5>
      <Row className="align-items-end">
        <Col md>
          <Form.Group controlId="formCode">
            <Form.Label>Code</Form.Label>
            <Form.Control
              value={code}
              onChange={e => setCode(e.target.value)}
              required
            />
          </Form.Group>
        </Col>
        <Col md>
          <Form.Group controlId="formName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              value={threadName}
              onChange={e => setThreadName(e.target.value)}
              required
            />
          </Form.Group>
        </Col>
        <Col md="auto">
          <Form.Group controlId="formHex">
            <Form.Label>Color</Form.Label>
            <Form.Control
              type="color"
              value={hex}
              onChange={e => setHex(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col md="auto" className="d-flex align-items-center">
          <Form.Check
            id="formOwned"
            type="checkbox"
            label="Owned"
            checked={owned}
            onChange={e => setOwned(e.target.checked)}
            className="me-2"
          />
          <Button variant="primary" type="submit">
            Add
          </Button>
        </Col>
      </Row>
      {error && (
        <Alert variant="danger" className="mt-2">
          {error}
        </Alert>
      )}
    </Form>
  );
}
