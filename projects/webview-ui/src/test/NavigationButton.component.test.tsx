import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NavigationButton } from '../components/NavigationButton';
import { MemoryRouter } from 'react-router-dom';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

test('renders NavigationButton and navigates on click', () => {
  const mockOnNavigate = jest.fn();

  render(
    <MemoryRouter>
      <NavigationButton 
        target="/test-route" 
        label="Go To Test" 
        onNavigate={mockOnNavigate} 
      />
    </MemoryRouter>
  );

  // Button should be in the document
  const button = screen.getByRole('button', { name: /Go To Test/i });
  expect(button).toBeInTheDocument();

  // Simulate click
  fireEvent.click(button);

  // onNavigate and navigate should both have been called
  expect(mockOnNavigate).toHaveBeenCalledTimes(1);
  expect(mockNavigate).toHaveBeenCalledWith('/test-route');
});
