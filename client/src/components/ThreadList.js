// client/src/components/ThreadList.js

import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * ThreadList
 *
 * Props:
 *   - threads: Array of { id, code, name, hex, owned }
 *   - fetchFn: function (e.g. authFetch) that does `fetch(url, opts)` with the JWT
 *   - onUpdate: callback(thread)   → parent will merge this updated thread into state
 *   - onDelete: callback(id)       → parent will remove that thread from state
 */
export default function ThreadList({ threads, fetchFn, onUpdate, onDelete }) {
  const [error, setError] = useState('');

  // When “Owned?” checkbox is toggled
  const handleToggleOwned = async (thread) => {
    setError('');
    const updatedOwned = !thread.owned;

    try {
      // Send a PUT to /api/threads/:id with the new owned value (plus code/name/hex)
      const res = await fetchFn(`/api/threads/${thread.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: thread.code,
          name: thread.name,
          hex: thread.hex,
          owned: updatedOwned
        })
      });

      if (!res.ok) {
        // If the server returned a non‐2xx, try to read its { error: … } message
        const errJson = await res.json();
        throw new Error(errJson.error || 'Update failed');
      }

      // Let the parent know: “This thread was updated to owned = updatedOwned.”
      onUpdate({ ...thread, owned: updatedOwned });
    } catch (err) {
      console.error(err);
      setError('Failed to update thread');
    }
  };

  // When “Delete” is clicked
  const handleDelete = async (id) => {
    setError('');
    try {
      const res = await fetchFn(`/api/threads/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Delete failed');
      }
      onDelete(id);
    } catch (err) {
      console.error(err);
      setError('Failed to delete thread');
    }
  };

  return (
    <div className="mt-4">
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <table className="table table-striped thread-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Color</th>
            <th>Owned?</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {threads.map((thread) => (
            <tr key={thread.id}>
              <td>{thread.code}</td>
              <td>{thread.name}</td>
              <td
                style={{
                  backgroundColor: thread.hex,
                  color: '#fff',
                  textAlign: 'center'
                }}>
                {thread.hex}
              </td>
              <td className="align-middle text-center">
                <input
                  type="checkbox"
                  checked={!!thread.owned}
                  onChange={() => handleToggleOwned(thread)}
                />
              </td>
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(thread.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}

          {threads.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center text-muted">
                No threads found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

ThreadList.propTypes = {
  threads: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      code: PropTypes.string.isRequired,
      name: PropTypes.string,
      hex: PropTypes.string,
      owned: PropTypes.oneOfType([PropTypes.bool, PropTypes.number])
    })
  ).isRequired,
  fetchFn: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};
