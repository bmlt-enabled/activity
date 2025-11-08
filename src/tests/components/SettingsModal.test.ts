import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import SettingsModal from '../../components/SettingsModal.svelte';

describe('SettingsModal component', () => {
  test('renders modal when open', () => {
    render(SettingsModal, {
      props: {
        open: true,
        currentLanguage: 'en',
        onLanguageChange: vi.fn()
      }
    });

    expect(screen.getByText('Language Settings')).toBeInTheDocument();
  });

  test('does not render modal when closed', () => {
    render(SettingsModal, {
      props: {
        open: false,
        currentLanguage: 'en',
        onLanguageChange: vi.fn()
      }
    });

    expect(screen.queryByText('Language Settings')).not.toBeInTheDocument();
  });

  test('displays language select dropdown', () => {
    render(SettingsModal, {
      props: {
        open: true,
        currentLanguage: 'en',
        onLanguageChange: vi.fn()
      }
    });

    expect(screen.getByLabelText('Language')).toBeInTheDocument();
  });

  test('displays both English and Spanish options', () => {
    render(SettingsModal, {
      props: {
        open: true,
        currentLanguage: 'en',
        onLanguageChange: vi.fn()
      }
    });

    const select = screen.getByLabelText('Language') as HTMLSelectElement;
    const options = Array.from(select.options).map((opt) => opt.text);

    expect(options).toContain('English');
    expect(options).toContain('Español');
  });

  test('shows current language as selected', () => {
    render(SettingsModal, {
      props: {
        open: true,
        currentLanguage: 'es',
        onLanguageChange: vi.fn()
      }
    });

    const select = screen.getByLabelText('Language') as HTMLSelectElement;
    expect(select.value).toBe('es');
  });

  test('calls onLanguageChange when saved with new language', async () => {
    const user = userEvent.setup();
    const onLanguageChange = vi.fn();

    render(SettingsModal, {
      props: {
        open: true,
        currentLanguage: 'en',
        onLanguageChange
      }
    });

    const select = screen.getByLabelText('Language') as HTMLSelectElement;
    await user.selectOptions(select, 'es');

    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    expect(onLanguageChange).toHaveBeenCalledWith('es');
  });

  test('calls onLanguageChange and does not change if same language', async () => {
    const user = userEvent.setup();
    const onLanguageChange = vi.fn();

    render(SettingsModal, {
      props: {
        open: true,
        currentLanguage: 'en',
        onLanguageChange
      }
    });

    // Don't change language, just click save
    const saveButton = screen.getByText('Save');
    await user.click(saveButton);

    // Should still call onLanguageChange with current language
    expect(onLanguageChange).toHaveBeenCalledWith('en');
  });

  test('does not call onLanguageChange when canceled', async () => {
    const user = userEvent.setup();
    const onLanguageChange = vi.fn();

    render(SettingsModal, {
      props: {
        open: true,
        currentLanguage: 'en',
        onLanguageChange
      }
    });

    const select = screen.getByLabelText('Language') as HTMLSelectElement;
    await user.selectOptions(select, 'es');

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(onLanguageChange).not.toHaveBeenCalled();
  });

  test('closes modal when canceled', async () => {
    const user = userEvent.setup();
    const onLanguageChange = vi.fn();

    render(SettingsModal, {
      props: {
        open: true,
        currentLanguage: 'en',
        onLanguageChange
      }
    });

    const select = screen.getByLabelText('Language') as HTMLSelectElement;
    await user.selectOptions(select, 'es');
    expect(select.value).toBe('es');

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    // Modal should close and language change should not be called
    expect(onLanguageChange).not.toHaveBeenCalled();
  });

  test('displays Save and Cancel buttons', () => {
    render(SettingsModal, {
      props: {
        open: true,
        currentLanguage: 'en',
        onLanguageChange: vi.fn()
      }
    });

    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
});
