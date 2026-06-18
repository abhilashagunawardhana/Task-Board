import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import React from 'react';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        { id: 1, title: 'Mocked Task 1', status: 'Todo' },
        { id: 2, title: 'Mocked Task 2', status: 'In Progress' }
      ]),
    })
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('renders Task Board header and lists tasks', async () => {
  render(<App />);
  
  // Check headers
  const headerElement = screen.getByRole('heading', { name: /Task Board/i });
  expect(headerElement).toBeInTheDocument();
  
  // Check if mocked tasks are rendered
  await waitFor(() => {
    expect(screen.getByText('Mocked Task 1')).toBeInTheDocument();
    expect(screen.getByText('Mocked Task 2')).toBeInTheDocument();
  });
});
