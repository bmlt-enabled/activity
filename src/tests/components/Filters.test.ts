import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Filters from '../../components/Filters.svelte';

describe('Filters component', () => {
  test('renders all filter controls', () => {
    render(Filters, {
      props: {
        searchTerm: '',
        selectedType: '',
        selectedUser: '',
        users: []
      }
    });

    expect(screen.getByLabelText('Search')).toBeInTheDocument();
    expect(screen.getByLabelText('Change Type')).toBeInTheDocument();
    expect(screen.getByLabelText('User')).toBeInTheDocument();
  });

  test('displays search placeholder text', () => {
    render(Filters, {
      props: {
        searchTerm: '',
        selectedType: '',
        selectedUser: '',
        users: []
      }
    });

    const searchInput = screen.getByPlaceholderText('Search by meeting name, user, or change type...');
    expect(searchInput).toBeInTheDocument();
  });

  test('displays all change type options', () => {
    render(Filters, {
      props: {
        searchTerm: '',
        selectedType: '',
        selectedUser: '',
        users: []
      }
    });

    const typeSelect = screen.getByLabelText('Change Type') as HTMLSelectElement;
    const options = Array.from(typeSelect.options).map((opt) => opt.text);

    expect(options).toContain('All Types');
    expect(options).toContain('Changes');
    expect(options).toContain('New');
    expect(options).toContain('Deleted');
    expect(options).toContain('Rollback');
  });

  test('displays user options including "All Users"', () => {
    render(Filters, {
      props: {
        searchTerm: '',
        selectedType: '',
        selectedUser: '',
        users: ['Alice', 'Bob', 'Charlie']
      }
    });

    const userSelect = screen.getByLabelText('User') as HTMLSelectElement;
    const options = Array.from(userSelect.options).map((opt) => opt.text);

    expect(options).toContain('All Users');
    expect(options).toContain('Alice');
    expect(options).toContain('Bob');
    expect(options).toContain('Charlie');
  });

  test('allows typing in search input', async () => {
    const user = userEvent.setup();
    render(Filters, {
      props: {
        searchTerm: '',
        selectedType: '',
        selectedUser: '',
        users: []
      }
    });

    const searchInput = screen.getByLabelText('Search') as HTMLInputElement;

    await user.type(searchInput, 'test meeting');

    expect(searchInput.value).toBe('test meeting');
  });

  test('allows selecting a change type', async () => {
    const user = userEvent.setup();
    render(Filters, {
      props: {
        searchTerm: '',
        selectedType: '',
        selectedUser: '',
        users: []
      }
    });

    const typeSelect = screen.getByLabelText('Change Type') as HTMLSelectElement;

    await user.selectOptions(typeSelect, 'new');

    expect(typeSelect.value).toBe('new');
  });

  test('allows selecting a user', async () => {
    const user = userEvent.setup();
    render(Filters, {
      props: {
        searchTerm: '',
        selectedType: '',
        selectedUser: '',
        users: ['Alice', 'Bob']
      }
    });

    const userSelect = screen.getByLabelText('User') as HTMLSelectElement;

    await user.selectOptions(userSelect, 'Alice');

    expect(userSelect.value).toBe('Alice');
  });

  test('renders with initial values', () => {
    render(Filters, {
      props: {
        searchTerm: 'initial search',
        selectedType: 'change',
        selectedUser: 'Bob',
        users: ['Alice', 'Bob', 'Charlie']
      }
    });

    const searchInput = screen.getByLabelText('Search') as HTMLInputElement;
    const typeSelect = screen.getByLabelText('Change Type') as HTMLSelectElement;
    const userSelect = screen.getByLabelText('User') as HTMLSelectElement;

    expect(searchInput.value).toBe('initial search');
    expect(typeSelect.value).toBe('change');
    expect(userSelect.value).toBe('Bob');
  });

  test('handles empty user list', () => {
    render(Filters, {
      props: {
        searchTerm: '',
        selectedType: '',
        selectedUser: '',
        users: []
      }
    });

    const userSelect = screen.getByLabelText('User') as HTMLSelectElement;
    const options = Array.from(userSelect.options).map((opt) => opt.text);

    expect(options).toContain('All Users');
    expect(options.length).toBeGreaterThanOrEqual(1);
  });
});
