import { render, screen } from '@testing-library/react';
import DuoPreviaApp from './App';

test('renders learn react link', () => {
  render(<DuoPreviaApp />);
  const linkElement = screen.getByText(/DUO Previa/i);
  expect(linkElement).toBeInTheDocument();
});
