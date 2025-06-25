// client/src/pages/ProjectsListPage.js
import React, { useState } from 'react';

export default function ProjectsListPage({
  projects,
  onCreate,    // from App.js → handleCreateProject
  onDelete,    // from App.js → handleDeleteProject
}) {
  const [name, setName]        = useState('');
  const [description, setDesc] = useState('');
  const [error, setError]      = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      await onCreate({ name, description });
      setName('');
      setDesc('');
    } catch (err) {
      console.error('Create project error', err);
      setError('Failed to create project');
    }
  };

  return (
    <div>
      <h2>New Project</h2>
      <form onSubmit={handleSubmit} style={{ margin: '1rem 0' }}>
        <div className="mb-2">
          <label>
            Name:
            <input
              className="form-control"
              required
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </label>
        </div>
        <div className="mb-2">
          <label>
            Description:
            <input
              className="form-control"
              value={description}
              onChange={e => setDesc(e.target.value)}
            />
          </label>
        </div>
        <button className="btn btn-primary" type="submit">
          Create Project
        </button>
        {error && <div className="alert alert-danger mt-2">{error}</div>}
      </form>

      <h2>Projects</h2>
      {projects.length === 0 ? (
        <p>No projects yet.</p>
      ) : (
        <ul className="list-group">
          {projects.map(p => (
            <li
              key={p.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              {p.name}
              <button
                className="btn btn-sm btn-danger"
                onClick={() => onDelete(p.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
