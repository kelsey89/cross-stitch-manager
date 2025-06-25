// src/components/EditThreadModal.js
import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

export default function EditThreadModal({ show, thread, onSave, onClose }) {
  const [formData, setFormData] = useState(thread || {});

  useEffect(() => setFormData(thread), [thread]);

  const handleSubmit = e => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Thread</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group controlId="editCode">
            <Form.Label>Code</Form.Label>
            <Form.Control
              value={formData.code || ''}
              onChange={e => setFormData({...formData, code:e.target.value})}
            />
          </Form.Group>
          {/* repeat for name, hex, owned checkbox */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit">Save</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
