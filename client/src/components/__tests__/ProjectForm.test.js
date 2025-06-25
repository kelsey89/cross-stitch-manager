// src/components/__tests__/ProjectForm.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProjectForm from '../ProjectForm';

describe('ProjectForm component', () => {
  beforeEach(() => {
    // mock fetch to return a project with id
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 5, name: 'TestProj', description: 'Desc' })
      })
    );
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders inputs and button', () => {
    render(<ProjectForm onCreate={() => {}} />);
    expect(screen.getByRole('heading', { name: /new project/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create project/i })).toBeInTheDocument();
  });

  it('calls onCreate with the server response and clears inputs', async () => {
    const mockOnCreate = jest.fn();
    render(<ProjectForm onCreate={mockOnCreate} />);

    fireEvent.change(screen.getByLabelText(/name:/i), { target: { value: 'XYZ' } });
    fireEvent.change(screen.getByLabelText(/description:/i), { target: { value: 'ABC' } });
    fireEvent.click(screen.getByRole('button', { name: /create project/i }));

    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledWith({
        id: 5,
        name: 'TestProj',
        description: 'Desc'
      });
    });

    // inputs should be cleared
    expect(screen.getByLabelText(/name:/i)).toHaveValue('');
    expect(screen.getByLabelText(/description:/i)).toHaveValue('');
  });

  it('handles server errors gracefully', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) })
    );
    render(<ProjectForm onCreate={() => {}} />);

    fireEvent.change(screen.getByLabelText(/name:/i), { target: { value: 'Bad' } });
    fireEvent.click(screen.getByRole('button', { name: /create project/i }));

    const errorMsg = await screen.findByText(/failed to create project/i);
    expect(errorMsg).toBeInTheDocument();
  });
});
