import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/svelte';
import index from './index.svelte';

test('shows proper heading when rendered', () => {
  const { getByText } = render(index);
  expect(getByText('Hello world!')).toBeInTheDocument();
});
