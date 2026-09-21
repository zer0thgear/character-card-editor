import { render, screen } from '@testing-library/react';
import App from './App';
import ThemeContextProvider from './context/ThemeContext';

test('renders the tab for the v1 spec fields', () => {
  render(
    <ThemeContextProvider>
      <App />
    </ThemeContextProvider>
  );
  const tabElement = screen.getByText(/v1 spec fields/i);
  expect(tabElement).toBeInTheDocument();
});
