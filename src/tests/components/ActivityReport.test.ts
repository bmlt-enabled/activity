import { describe, test, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';
import ActivityReport from '../../components/ActivityReport.svelte';

describe('ActivityReport component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('renders without crashing', () => {
    const { container } = render(ActivityReport);
    expect(container).toBeTruthy();
  });

  test('renders with gradient background', () => {
    const { container } = render(ActivityReport);

    const wrapper = container.querySelector('.min-h-screen');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper?.classList.contains('bg-gradient-to-br')).toBe(true);
  });
});
