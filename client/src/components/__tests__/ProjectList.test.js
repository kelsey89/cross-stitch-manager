// src/components/__tests__/ProjectList.test.js
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProjectList from '../ProjectList';

describe('ProjectList component', () => {
  const projects = [
    { id: 1, name: 'Alpha' },
    { id: 2, name: 'Beta' },
    { id: 3, name: 'Gamma' }
  ];

  it('renders one button per project', () => {
    render(
      <ProjectList
        projects={projects}
        selectedId={2}
        onSelect={() => {}}
      />
    );
    // Should show three buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
  });

  it('highlights the selected project', () => {
    render(
      <ProjectList
        projects={projects}
        selectedId={2}
        onSelect={() => {}}
      />
    );
    const betaButton = screen.getByRole('button', { name: 'Beta' });
    // The inline style should set fontWeight to "bold"
    expect(betaButton).toHaveStyle({ fontWeight: 'bold' });
  });

  it('calls onSelect with the project id when clicked', () => {
    const handleSelect = jest.fn();
    render(
      <ProjectList
        projects={projects}
        selectedId={null}
        onSelect={handleSelect}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Gamma' }));
    expect(handleSelect).toHaveBeenCalledWith(3);
  });
});
