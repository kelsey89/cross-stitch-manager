// client/src/App.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate
} from 'react-router-dom';
import {
  Container,
  Navbar,
  Nav,
  Button,
  Spinner
} from 'react-bootstrap';

import LoginForm from './components/LoginForm';
import HomePage from './pages/HomePage';
import ThreadsPage from './pages/ThreadsPage';
import ProjectsListPage from './pages/ProjectsListPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';

import logo from './assets/logo.png';
import './App.css';
import './custom.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [projects, setProjects] = useState([]);
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Wrap the fetch call so it always sends the Bearer token
  const authFetch = useCallback(
    (url, opts = {}) =>
      fetch(url, {
        ...opts,
        headers: {
          ...(opts.headers || {}),
          Authorization: `Bearer ${token}`
        }
      }),
    [token]
  );

  // Called after a successful login
  const handleLogin = tok => {
    localStorage.setItem('token', tok);
    setToken(tok);
  };

  // Called when the user clicks “Logout”
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setProjects([]);
    setThreads([]);
  };

  // On mount (or whenever token changes), fetch both projects & threads
  useEffect(() => {
    if (!token) return;

    setLoading(true);
    Promise.all([
      authFetch('/api/projects').then(r => r.json()),
      authFetch('/api/threads').then(r => r.json())
    ])
      .then(([pData, tData]) => {
        setProjects(pData);
        setThreads(tData);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [token, authFetch]);

  // ─── Project CRUD Handlers ───────────────────────────────────────────

  // Create a new project
  const handleCreateProject = async ({ name, description }) => {
    const res = await authFetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    });
    if (!res.ok) {
      throw new Error('Failed to create project');
    }
    const newProj = await res.json();
    setProjects(prev => [...prev, newProj]);
    return newProj;
  };

  // Delete a project by ID
  const handleDeleteProject = async id => {
    const res = await authFetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProjects(prev => prev.filter(p => p.id !== id));
    } else {
      console.error('Failed to delete project', id);
    }
  };

  // ─── Thread CRUD Handlers ────────────────────────────────────────────

  // Add a brand-new thread (from the “Add a New Thread” form)
  const handleAddThread = async ({ code, name, hex, owned }) => {
    const res = await authFetch('/api/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, name, hex, owned })
    });
    if (!res.ok) {
      throw new Error('Failed to add thread');
    }
    const newThread = await res.json();
    setThreads(prev => [...prev, newThread]);
    return newThread;
  };

  // Update an existing thread (called when you toggle “Owned?” or edit details)
  const handleUpdateThread = async (id, { code, name, hex, owned }) => {
    const res = await authFetch(`/api/threads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, name, hex, owned })
    });
    if (!res.ok) {
      throw new Error('Failed to update thread');
    }
    // Optimistically update local state
    const updated = { id, code, name, hex, owned };
    setThreads(prev => prev.map(t => (t.id === id ? updated : t)));
    return updated;
  };

  // Delete a thread by ID
  const handleDeleteThread = async id => {
    const res = await authFetch(`/api/threads/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setThreads(prev => prev.filter(t => t.id !== id));
    } else {
      console.error('Failed to delete thread', id);
    }
  };

  // If not logged in, show the LoginForm
  if (!token) {
    return (
      <Container className="mt-5">
        <LoginForm onLogin={handleLogin} />
      </Container>
    );
  }

  // While data is loading, show a spinner
  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  // ─── Main App UI ───────────────────────────────────────────────────────

  return (
    <div className="App">
      {/* Fixed logo in the top-left corner */}
      <img
        src={logo}
        alt="Cross-Stitch Project Manager logo"
        className="app-logo"
      />

      <BrowserRouter>
        <Navbar bg="light" expand="md" className="mb-4">
          <Container>
            <Navbar.Brand as={Link} to="/">
              Cross-Stitch Project Manager
            </Navbar.Brand>
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">
                Home
              </Nav.Link>
              <Nav.Link as={Link} to="/threads">
                Threads
              </Nav.Link>
              <Nav.Link as={Link} to="/projects">
                Projects
              </Nav.Link>
            </Nav>
            <Button variant="outline-danger" onClick={handleLogout}>
              Logout
            </Button>
          </Container>
        </Navbar>

        <Container>
          <Routes>
            {/* Home / Dashboard page */}
            <Route
              path="/"
              element={<HomePage projects={projects} />}
            />

            {/* Threads page */}
            <Route
              path="/threads"
              element={
                <ThreadsPage
                  threads={threads}
                  onAdd={handleAddThread}
                  onUpdate={threadData =>
                    handleUpdateThread(threadData.id, threadData)
                  }
                  onDelete={handleDeleteThread}
                  fetchFn={authFetch}
                  reloadThreads={async () => {
                    const t = await authFetch('/api/threads').then(r => r.json());
                    setThreads(t);
                  }}
                />
              }
            />

            {/* Projects list page */}
            <Route
              path="/projects"
              element={
                <ProjectsListPage
                  projects={projects}
                  onCreate={handleCreateProject}
                  onDelete={handleDeleteProject}
                  fetchFn={authFetch}
                />
              }
            />

            {/* Individual project details page (/:projectId) */}
            <Route
              path="/projects/:projectId"
              element={
                <ProjectDetailsPage
                  fetchFn={authFetch}
                  globalOnAddThread={handleAddThread}
                />
              }
            />

            {/* Redirect any unknown route back to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Container>
      </BrowserRouter>
    </div>
  );
}

export default App;
