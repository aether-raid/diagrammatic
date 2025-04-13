// @ts-ignore: React is needed for testing, but not used in the component
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { NavigationButton } from '../components/NavigationButton';
import '@testing-library/jest-dom';

const mockNavigate = jest.fn();

// Mock useNavigate from react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock HiddenLabelButton to render a basic button for testing
jest.mock('../components/HiddenLabelButton/HiddenLabelButton', () => ({
  HiddenLabelButton: ({ onClick, label, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} aria-label={label}>
      {label}
    </button>
  ),
}));

describe('NavigationButton Component', () => {
  it('calls navigate with the target path when clicked', () => {
    const { getByRole } = render(
      <NavigationButton target="/target-page" label="Go Somewhere" />
    );

    const button = getByRole('button', { name: 'Go Somewhere' });

    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/target-page');
  });

  it('calls onNavigate callback if provided', () => {
    const mockOnNavigate = jest.fn();

    const { getByRole } = render(
      <NavigationButton
        target="/target-page"
        label="Go Somewhere"
        onNavigate={mockOnNavigate}
      />
    );

    const button = getByRole('button', { name: 'Go Somewhere' });

    fireEvent.click(button);

    expect(mockOnNavigate).toHaveBeenCalled();
  });
});
