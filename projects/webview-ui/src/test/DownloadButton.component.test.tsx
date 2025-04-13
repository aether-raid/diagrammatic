// @ts-ignore: React is needed for testing, but not used in the component
import React from 'react';
import { render } from '@testing-library/react';
import DownloadButton from '../components/DownloadButton'; // Adjust the import path accordingly
import '@testing-library/jest-dom'; // for the 'toBeInTheDocument' matcher

// Mocking the required methods and components that the DownloadButton depends on
jest.mock('@xyflow/react', () => ({
    useReactFlow: jest.fn().mockReturnValue({
        getNodes: jest.fn(),
    }),
    getNodesBounds: jest.fn(),
    getViewportForBounds: jest.fn(() => ({ x: 0, y: 0, zoom: 1 })),
}));

jest.mock('html-to-image', () => ({
    toPng: jest.fn().mockResolvedValue('data:image/png;base64,abc123'),
}));

jest.mock('@mui/icons-material/DownloadRounded', () => {
    return function MockDownloadRoundedIcon() {
        return <svg data-testid="mock-download-icon" />;
    };
});

jest.mock('../components/HiddenLabelButton/HiddenLabelButton', () => ({
    HiddenLabelButton: ({ onClick, icon, label }: any) => (
        <button onClick={onClick} aria-label={label}>
            {icon}
            {label}
        </button>
    ),
}));

describe('DownloadButton Component', () => {
    test('should render the DownloadButton with the correct label and icon', () => {
        const { getByText, getByTestId } = render(<DownloadButton minZoom={0.5} maxZoom={2} />);
        
        // Check if the button with the correct label exists
        expect(getByText(/Download Diagram/i)).toBeInTheDocument();
        
        // Check if the icon is rendered (mocked as an svg with the test id "mock-download-icon")
        expect(getByTestId('mock-download-icon')).toBeInTheDocument();
    });
});

