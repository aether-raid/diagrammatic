import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { RegenerateButton } from '../components/RegenerateButton';
import { sendRegenerateComponentDiagramMessageToExtension } from '../helpers/vscodeApiHandler';

jest.mock('../helpers/vscodeApiHandler', () => ({
  sendRegenerateComponentDiagramMessageToExtension: jest.fn(),
}));

describe('RegenerateButton', () => {
  it('calls onRegenerate and sends message when clicked', () => {
    const mockOnRegenerate = jest.fn();

    const { getByText } = render(
      <RegenerateButton label="Regenerate" onRegenerate={mockOnRegenerate} />
    );

    const button = getByText('Regenerate');
    fireEvent.click(button);

    expect(mockOnRegenerate).toHaveBeenCalled();
    expect(sendRegenerateComponentDiagramMessageToExtension).toHaveBeenCalled();
  });

  it('disables button when disabled prop is true', () => {
    const { getByText } = render(
      <RegenerateButton label="Regenerate" disabled />
    );

    const button = getByText('Regenerate');
    expect(button).toBeDisabled();
  });
});
