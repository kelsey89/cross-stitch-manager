// src/components/__tests__/ThreadList.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import ThreadList from '../ThreadList';

describe('ThreadList component', () => {
  const sampleThreads = [
    { id: 1, code: '100', name: 'Test1', hex: '#ff0000', owned: true },
    { id: 2, code: '200', name: 'Test2', hex: '#00ff00', owned: false },
  ];

  it('renders table headers', () => {
    render(<ThreadList threads={sampleThreads} onDelete={() => {}} />);
    expect(screen.getByText('Code')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Color')).toBeInTheDocument();
    expect(screen.getByText('Owned?')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders one row per thread', () => {
    render(<ThreadList threads={sampleThreads} onDelete={() => {}} />);
    // there should be exactly two data rows
    const rows = screen.getAllByRole('row');
    // 1 header row + 2 data rows
    expect(rows).toHaveLength(3);
    // verify content of first data row
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('Test1')).toBeInTheDocument();
    expect(screen.getByText('#ff0000')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    // second row
    expect(screen.getByText('200')).toBeInTheDocument();
    expect(screen.getByText('Test2')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });
});
