import Enzyme from 'enzyme';
import Adapter from '@cfaester/enzyme-adapter-react-18';
import '@testing-library/jest-dom';

Enzyme.configure({ adapter: new Adapter() });

// Mock for ResizeObserver which React Flow might use
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));