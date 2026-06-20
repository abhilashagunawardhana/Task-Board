// Import React testing utilities and custom jest-dom matchers
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import React from 'react';

// Setup Mock for standard fetch calls before running each test case.
// This isolates the React component and prevents actual network requests.
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

// Restore original mocks after each test to keep environment clean
afterEach(() => {
  jest.restoreAllMocks();
});

// Test verification for rendering and asynchronous state updates
test('renders Task Board header and lists tasks', async () => {
  render(<App />);
  
  // Check if the page title "Task Board" renders successfully
  const headerElement = screen.getByRole('heading', { name: /Task Board/i });
  expect(headerElement).toBeInTheDocument();
  
  // Wait until the async mock fetch resolves and renders list cards on DOM
  await waitFor(() => {
    expect(screen.getByText('Mocked Task 1')).toBeInTheDocument();
    expect(screen.getByText('Mocked Task 2')).toBeInTheDocument();
  });
});
