// client/src/components/ProjectDetails.js

import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Spinner,
  Button,
  Modal
} from 'react-bootstrap';
import ThreadForm from './ThreadForm';

/**
 * Props:
 *  - projectId: number|null
 *  - fetchFn: function(url, opts) → authenticated fetch
 *  - globalOnAddThread: function(newThread)
 */
export default function ProjectDetails({
  projectId,
  fetchFn = fetch,
  globalOnAddThread
}) {
  const [project, setProject]       = useState(null);
  const [allThreads, setAllThreads] = useState([]);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [pdfError, setPdfError]     = useState('');
  const [editThread, setEditThread] = useState(null);

  // Fetch project + threads
  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    Promise.all([
      fetchFn(`/api/projects/${projectId}`).then(r => r.json()),
      fetchFn('/api/threads').then(r => r.json())
    ])
      .then(([proj, threads]) => {
        setProject(proj);
        setAllThreads(threads);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load data');
        setLoading(false);
      });
  }, [projectId, fetchFn]);

  if (!projectId) {
    return <p>Select a project to view details.</p>;
  }
  if (loading || project === null) {
    return (
      <div className="text-center my-3">
        <Spinner animation="border" /> Loading…
      </div>
    );
  }
  if (error) {
    return <p className="text-danger">{error}</p>;
  }

  // Toggle assignment
  const toggleAssignment = thread => {
    const assigned = (project.threads || []).some(t => t.id === thread.id);
    const method   = assigned ? 'DELETE' : 'POST';
    const url      = `/api/projects/${projectId}/threads/${thread.id}`;

    fetchFn(url, { method })
      .then(() => {
        setProject(prev => ({
          ...prev,
          threads: assigned
            ? prev.threads.filter(t => t.id !== thread.id)
            : [...(prev.threads || []), thread]
        }));
      })
      .catch(() => setError('Failed to update assignment'));
  };

  // Add & assign new thread
  const handleNewThread = async data => {
    const created = await globalOnAddThread(data);
    toggleAssignment(created);
    setAllThreads(prev => [...prev, created]);
  };

  // Upload a PDF
  const handleUploadPdf = async () => {
    setPdfError('');
    const input = document.getElementById('pdfInput');
    if (!input.files.length) {
      setPdfError('Please choose a file.');
      return;
    }
    const fd = new FormData();
    fd.append('pdf', input.files[0]);

    try {
      const res = await fetchFn(`/api/projects/${projectId}/pdf`, {
        method: 'POST',
        body: fd
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Upload failed');
      }
      // Refresh just the project
      const updated = await fetchFn(`/api/projects/${projectId}`).then(r => r.json());
      setProject(updated);
      input.value = '';
    } catch {
      setPdfError('Upload failed.');
    }
  };

  return (
    <>
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>{project.name}</Card.Title>
          <Card.Text>{project.description}</Card.Text>
          <hr />

          {/* PDF Section */}
          <h6>Project PDF</h6>
          <div className="d-flex align-items-center mb-2">
            <input
              id="pdfInput"
              type="file"
              accept="application/pdf"
              className="form-control me-2"
            />
            <Button variant="warning" onClick={handleUploadPdf}>
              Upload PDF
            </Button>
          </div>
          {pdfError && <div className="alert alert-danger">{pdfError}</div>}
          {project.pdf_filename && (
            <div className="mb-3">
              <a
                href={`http://localhost:3001/api/projects/${projectId}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-link"
              >
                View Uploaded PDF
              </a>
            </div>
          )}
          <hr />

          {/* Thread Assignment */}
          <h5>Threads ({(project.threads || []).length} assigned)</h5>
          {(allThreads || []).map(thread => {
            const assigned = (project.threads || []).some(t => t.id === thread.id);
            return (
              <div key={thread.id} className="mb-2 d-flex align-items-center">
                <Form.Check
                  type="checkbox"
                  id={`thread-${thread.id}`}
                  label={`${thread.code} — ${thread.name}`}
                  checked={assigned}
                  onChange={() => toggleAssignment(thread)}
                />
                <Button
                  size="sm"
                  variant="outline-secondary"
                  className="ms-2"
                  onClick={() => setEditThread(thread)}
                >
                  Edit
                </Button>
              </div>
            );
          })}
          <hr />

          {/* Add & Assign */}
          <h6>Add & Assign a New Thread</h6>
          <ThreadForm onAdd={handleNewThread} fetchFn={fetchFn} />
        </Card.Body>
      </Card>

      {/* Edit Thread Modal */}
      <Modal show={!!editThread} onHide={() => setEditThread(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Thread</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editThread && (
            <Form
              onSubmit={e => {
                e.preventDefault();
                const f = e.target;
                const data = {
                  code: f.elements.code.value,
                  name: f.elements.name.value,
                  hex: f.elements.hex.value,
                  owned: f.elements.owned.checked
                };
                fetchFn(`/api/threads/${editThread.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
                })
                  .then(r => { if (!r.ok) throw new Error(); return r.json(); })
                  .then(() => {
                    setAllThreads(prev =>
                      prev.map(t => (t.id === editThread.id ? { id: editThread.id, ...data } : t))
                    );
                    setProject(prev => ({
                      ...prev,
                      threads: (prev.threads || []).map(t =>
                        t.id === editThread.id ? { id: editThread.id, ...data } : t
                      )
                    }));
                    setEditThread(null);
                  })
                  .catch(() => setError('Failed to update thread'));
              }}
            >
              <Form.Group controlId="code" className="mb-2">
                <Form.Label>Code</Form.Label>
                <Form.Control name="code" defaultValue={editThread.code} />
              </Form.Group>
              <Form.Group controlId="name" className="mb-2">
                <Form.Label>Name</Form.Label>
                <Form.Control name="name" defaultValue={editThread.name} />
              </Form.Group>
              <Form.Group controlId="hex" className="mb-2">
                <Form.Label>Color</Form.Label>
                <Form.Control name="hex" type="color" defaultValue={editThread.hex} />
              </Form.Group>
              <Form.Group controlId="owned" className="mb-2">
                <Form.Check name="owned" label="Owned" defaultChecked={editThread.owned} />
              </Form.Group>
              <Button type="submit">Save Changes</Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}
