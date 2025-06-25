// src/components/__tests__/ProjectDetails.test.js
import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor
} from '@testing-library/react';
import ProjectDetails from '../ProjectDetails';

describe('ProjectDetails component', () => {
  beforeEach(() => {
    // Silence any console errors
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    delete global.fetch;
  });

  it('prompts when no project is selected', () => {
    render(<ProjectDetails projectId={null} />);
    expect(
      screen.getByText(/select a project to view details/i)
    ).toBeInTheDocument();
  });

  it('fetches and displays project name, description, and thread checkboxes', async () => {
    const projectPayload = {
      id: 1,
      name: 'Sample Project',
      description: 'This is a test project',
      threads: [
        { id: 1, code: '100', name: 'Thread A', hex: '#111111', owned: 1 }
      ]
    };
    const allThreadsPayload = [
      { id: 1, code: '100', name: 'Thread A', hex: '#111111', owned: 1 },
      { id: 2, code: '200', name: 'Thread B', hex: '#222222', owned: 0 }
    ];

    // Mock fetch: first call returns project, second returns all threads
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(projectPayload)
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(allThreadsPayload)
      });

    render(<ProjectDetails projectId={1} />);

    // Wait for project name and description to appear
    expect(await screen.findByText('Sample Project')).toBeInTheDocument();
    expect(screen.getByText('This is a test project')).toBeInTheDocument();

    // Now the two checkboxes should be rendered
    // Checkbox for Thread A (assigned)
    const cbA = screen.getByLabelText(/100\s+—\s+Thread A/i);
    expect(cbA).toBeChecked();

    // Checkbox for Thread B (unassigned)
    const cbB = screen.getByLabelText(/200\s+—\s+Thread B/i);
    expect(cbB).not.toBeChecked();
  });
});
