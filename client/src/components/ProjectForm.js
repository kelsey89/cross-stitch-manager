// client/src/components/ProjectForm.js

import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

export default function ProjectForm({ onCreate, fetchFn = fetch }) {
  const [name, setName]   = useState('');
  const [desc, setDesc]   = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetchFn('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: desc })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Status ${res.status}`);
      }

      const project = await res.json();
      onCreate(project);
      setName('');
      setDesc('');
    } catch (err) {
      console.error(err);
      setError('Failed to create project');
    }
  };

  return (
    <Form onSubmit={handleSubmit} style={{ margin: '1rem 0' }}>
      <h3>New Project</h3>

      <Form.Group controlId="formProjectName" className="mb-2">
        <Form.Label>Name:</Form.Label>
        <Form.Control
          value={name}
          onChange={e => setName(e.target.value)}
          required
        />
      </Form.Group>

      <Form.Group controlId="formProjectDesc" className="mb-2">
        <Form.Label>Description:</Form.Label>
        <Form.Control
          value={desc}
          onChange={e => setDesc(e.target.value)}
        />
      </Form.Group>

      <Button type="submit">Create Project</Button>

      {error && (
        <Alert variant="danger" className="mt-2">
          {error}
        </Alert>
      )}
    </Form>
  );
}
