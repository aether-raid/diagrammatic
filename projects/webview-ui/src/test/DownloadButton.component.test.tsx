import React from 'react';
import { render } from '@testing-library/react';
import DownloadButton from '../components/DownloadButton';

jest.mock('@xyflow/react');

test('renders without crashing', () => {
    render(<DownloadButton />);
  });
