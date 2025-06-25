// client/src/components/ProjectList.js
import React from 'react';

export default function ProjectList({
  projects,
  onSelect,
  selectedId,
  onDelete  // new prop
}) {
  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {projects.map(p => (
        <li
          key={p.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '0.5rem 0'
          }}
        >
          <button
            style={{
              flexGrow: 1,
              textAlign: 'left',
              background: 'none',
              border: 'none',
              padding: 0,
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: p.id === selectedId ? 'bold' : 'normal'
            }}
            onClick={() => onSelect(p.id)}
          >
            {p.name}
          </button>
          <button
            onClick={e => {
              e.stopPropagation();  // prevent onSelect firing
              onDelete(p.id);
            }}
            style={{
              marginLeft: '0.5rem',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.25rem',
              cursor: 'pointer'
            }}
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}
