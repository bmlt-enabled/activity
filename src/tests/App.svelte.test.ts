import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render } from '@testing-library/svelte';

import App from '../App.svelte';

describe('App', () => {
  test('renders without crashing', () => {
    const { container } = render(App);
    expect(container).toBeTruthy();
  });
});
