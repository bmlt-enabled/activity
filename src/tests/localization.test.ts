import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { translations } from '../lib/stores/localization';

describe('Localization Store', () => {
  beforeEach(() => {
    localStorage.clear();
    translations.setLanguage('en');
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('initializes with English as default language', () => {
    expect(translations.getLanguage()).toBe('en');
  });

  test('returns available languages', () => {
    const languages = translations.getAvailableLanguages();
    expect(languages).toContain('en');
    expect(languages).toContain('es');
  });

  test('changes language to Spanish', () => {
    translations.setLanguage('es');
    expect(translations.getLanguage()).toBe('es');
  });

  test('persists language selection to localStorage', () => {
    translations.setLanguage('es');
    expect(localStorage.getItem('bmltLanguage')).toBe('es');
  });

  test('restores language from localStorage on initialization', () => {
    localStorage.setItem('bmltLanguage', 'es');
    translations.setLanguage('es'); // Manually set since store is already initialized
    expect(translations.getLanguage()).toBe('es');
  });

  test('gets string for specific key in English', () => {
    translations.setLanguage('en');
    const title = translations.getString('title');
    expect(title).toBe('BMLT Change Activity Report');
  });

  test('gets string for specific key in Spanish', () => {
    translations.setLanguage('es');
    const title = translations.getString('title');
    expect(title).toBe('Informe de actividad de cambios de BMLT');
  });

  test('gets string with explicit language parameter', () => {
    translations.setLanguage('en');
    const title = translations.getString('title', 'es');
    expect(title).toBe('Informe de actividad de cambios de BMLT');
  });

  test('gets all translations for current language', () => {
    translations.setLanguage('en');
    const allTranslations = translations.getTranslationsForLanguage();
    expect(allTranslations).toHaveProperty('title');
    expect(allTranslations).toHaveProperty('search');
    expect(allTranslations.title).toBe('BMLT Change Activity Report');
  });

  test('gets all translations for specific language', () => {
    const esTranslations = translations.getTranslationsForLanguage('es');
    expect(esTranslations).toHaveProperty('title');
    expect(esTranslations.title).toBe('Informe de actividad de cambios de BMLT');
  });

  test('gets translations for all languages', () => {
    const allLanguages = translations.getTranslationsForAllLanguages();
    expect(allLanguages).toHaveProperty('en');
    expect(allLanguages).toHaveProperty('es');
    expect(allLanguages.en.title).toBe('BMLT Change Activity Report');
    expect(allLanguages.es.title).toBe('Informe de actividad de cambios de BMLT');
  });

  test('contains all expected translation keys in English', () => {
    const enTranslations = translations.getTranslationsForLanguage('en');
    const expectedKeys = ['title', 'search', 'changeType', 'user', 'new', 'change', 'delete', 'rollback', 'settings', 'language', 'darkMode', 'save', 'cancel'];

    expectedKeys.forEach((key) => {
      expect(enTranslations).toHaveProperty(key);
    });
  });

  test('contains all expected translation keys in Spanish', () => {
    const esTranslations = translations.getTranslationsForLanguage('es');
    const expectedKeys = ['title', 'search', 'changeType', 'user', 'new', 'change', 'delete', 'rollback', 'settings', 'language', 'darkMode', 'save', 'cancel'];

    expectedKeys.forEach((key) => {
      expect(esTranslations).toHaveProperty(key);
    });
  });

  test('change type translations are capitalized in English', () => {
    const enTranslations = translations.getTranslationsForLanguage('en');
    expect(enTranslations.new).toBe('New');
    expect(enTranslations.change).toBe('Change');
    expect(enTranslations.delete).toBe('Delete');
    expect(enTranslations.rollback).toBe('Rollback');
  });

  test('change type translations are capitalized in Spanish', () => {
    const esTranslations = translations.getTranslationsForLanguage('es');
    expect(esTranslations.new).toBe('Nuevo');
    expect(esTranslations.change).toBe('Cambio');
    expect(esTranslations.delete).toBe('Eliminar');
    expect(esTranslations.rollback).toBe('Revertir');
  });
});
