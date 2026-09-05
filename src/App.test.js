import { render, screen } from '@testing-library/react';
import App, { getMessageApiUrl } from './App';

test('uses a valid API endpoint for the message form', () => {
  const original = process.env.REACT_APP_API_URL;
  process.env.REACT_APP_API_URL = 'https://api.example.com';

  expect(getMessageApiUrl()).toBe('https://api.example.com/api/messages');

  process.env.REACT_APP_API_URL = original;
});

test('renders the wedding page content', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /Saif.*Meyssem/i })).toBeInTheDocument();
});
