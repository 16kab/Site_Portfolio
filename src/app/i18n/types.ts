export const LANGS = ['fr', 'en'] as const;
export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = 'fr';
export const LANG_STORAGE_KEY = 'lang';

export function isLang(value: unknown): value is Lang {
  return value === 'fr' || value === 'en';
}
