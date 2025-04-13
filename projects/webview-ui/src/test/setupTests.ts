import '@testing-library/jest-dom';

// Mock for ResizeObserver which React Flow might use
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));