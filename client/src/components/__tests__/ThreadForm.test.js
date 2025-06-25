// client/src/components/__tests__/ThreadForm.test.js

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ThreadForm from '../ThreadForm';

describe('ThreadForm component', () => {
  beforeEach(() => {
    // Silence console.error for each test
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // Default fetch mock: successful POST returning { id: 123 }
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ id: 123 })
      })
    );
  });

  afterEach(() => {
    // Restore console.error and fetch mocks
    jest.restoreAllMocks();
  });

  it('calls onAdd with form data when submitted', async () => {
    const mockOnAdd = jest.fn();
    render(<ThreadForm onAdd={mockOnAdd} />);

    fireEvent.change(screen.getByLabelText(/Code/i), {
      target: { value: '300' }
    });
    fireEvent.change(screen.getByLabelText(/^Name$/i), {
      target: { value: 'NewThread' }
    });
    fireEvent.change(screen.getByLabelText(/Color/i), {
      target: { value: '#123456' }
    });
    fireEvent.click(screen.getByLabelText(/Owned/i));

    fireEvent.click(screen.getByRole('button', { name: /Add/i }));

    await waitFor(() => {
      expect(mockOnAdd).toHaveBeenCalledTimes(1);
      expect(mockOnAdd).toHaveBeenCalledWith({
        id: 123,
        code: '300',
        name: 'NewThread',
        hex: '#123456',
        owned: true
      });
    });
  });

  it('shows an error alert if submission fails', async () => {
    // Override fetch to simulate server error
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({})
      })
    );

    render(<ThreadForm onAdd={() => {}} />);

    fireEvent.change(screen.getByLabelText(/Code/i), {
      target: { value: '400' }
    });
    fireEvent.change(screen.getByLabelText(/^Name$/i), {
      target: { value: 'FailThread' }
    });
    fireEvent.click(screen.getByRole('button', { name: /Add/i }));

    const alert = await screen.findByText(/Failed to add thread/i);
    expect(alert).toBeInTheDocument();
  });
});
