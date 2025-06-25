// client/src/pages/ThreadsPage.js

import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';

import ThreadForm from '../components/ThreadForm';
import ThreadList from '../components/ThreadList';

export default function ThreadsPage({
  threads,
  onAdd,
  onUpdate,
  onDelete,
  fetchFn,
  reloadThreads
}) {
  const fileInputRef = useRef(null);
  const [importError, setImportError] = useState('');

  const handleExport = () => {
    // Simply navigates to the CSV download endpoint
    window.location.href = '/api/threads/export';
  };

  const handleImport = async () => {
    setImportError('');
    const files = fileInputRef.current.files;
    if (!files.length) {
      alert('Please choose a file first.');
      return;
    }

    const fd = new FormData();
    fd.append('file', files[0]);

    try {
      const res = await fetchFn('/api/threads/import', {
        method: 'POST',
        body: fd
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Import failed');
      }
      await reloadThreads();
      fileInputRef.current.value = '';
    } catch (err) {
      console.error('Import error', err);
      setImportError(err.message);
    }
  };

  return (
    <>
      <h2 style={{ color: 'var(--bs-primary)', marginBottom: '1rem' }}>
        Threads
      </h2>

      <div className="mb-3">
        <button
          className="btn btn-secondary me-2"
          onClick={handleExport}
        >
          Export CSV
        </button>

        <input
          type="file"
          accept=".csv,.json"
          ref={fileInputRef}
          className="form-control d-inline-block"
          style={{ width: 'auto', display: 'inline-block', verticalAlign: 'middle', marginRight: '0.5rem' }}
        />

        <button
          className="btn btn-secondary"
          onClick={handleImport}
        >
          Import File
        </button>

        {importError && (
          <div className="alert alert-danger mt-2">
            Failed to import threads: {importError}
          </div>
        )}
      </div>

      <ThreadForm onAdd={onAdd} fetchFn={fetchFn} />

      <ThreadList
        threads={threads}
        fetchFn={fetchFn}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </>
  );
}

ThreadsPage.propTypes = {
  threads: PropTypes.arrayOf(
    PropTypes.shape({
      id:   PropTypes.number,
      code: PropTypes.string,
      name: PropTypes.string,
      hex:  PropTypes.string,
      owned:PropTypes.bool
    })
  ).isRequired,
  onAdd:        PropTypes.func.isRequired,
  onUpdate:     PropTypes.func.isRequired,
  onDelete:     PropTypes.func.isRequired,
  fetchFn:      PropTypes.func.isRequired,
  reloadThreads:PropTypes.func.isRequired
};
