// @ts-ignore: React is needed for testing, but not used in the component
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { RegenerateButton } from '../components/RegenerateButton';
import '@testing-library/jest-dom';

// Mock the vscodeApiHandler helper function
const mockSendMessage = jest.fn();
jest.mock('../helpers/vscodeApiHandler', () => ({
  sendRegenerateComponentDiagramMessageToExtension: () => mockSendMessage(),
}));

// Mock HiddenLabelButton to simplify rendering
jest.mock('../components/HiddenLabelButton/HiddenLabelButton', () => ({
  HiddenLabelButton: ({ onClick, label, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} aria-label={label}>
      {label}
    </button>
  ),
}));

describe('RegenerateButton Component', () => {
  it('calls sendRegenerateComponentDiagramMessageToExtension when clicked', () => {
    const { getByRole } = render(
      <RegenerateButton label="Regenerate" />
    );

    const button = getByRole('button', { name: 'Regenerate' });

    fireEvent.click(button);

    expect(mockSendMessage).toHaveBeenCalled();
  });

  it('calls onRegenerate callback if provided', () => {
    const mockOnRegenerate = jest.fn();

    const { getByRole } = render(
      <RegenerateButton label="Regenerate" onRegenerate={mockOnRegenerate} />
    );

    const button = getByRole('button', { name: 'Regenerate' });

    fireEvent.click(button);

    expect(mockOnRegenerate).toHaveBeenCalled();
  });
});
