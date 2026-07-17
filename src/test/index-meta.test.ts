import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const indexHtml = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
const themeInit = readFileSync(
  resolve(process.cwd(), 'public/theme-init.js'),
  'utf8',
);

describe('Safari chrome initialization', () => {
  it('uses the application dark default before React starts', () => {
    expect(indexHtml).toContain(
      '<meta name="theme-color" content="#111111" />',
    );
    expect(indexHtml).toContain('<script src="/theme-init.js"></script>');
    expect(themeInit).toContain("var isDark = theme !== 'light';");
    expect(themeInit).not.toContain('prefersDark');
  });

  it('enables the translucent Apple standalone status bar', () => {
    expect(indexHtml).toContain(
      '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />',
    );
  });
});

describe('SEO static tags', () => {
  it('declares Open Graph, Twitter card, canonical and icons', () => {
    expect(indexHtml).toContain('property="og:title"');
    expect(indexHtml).toContain('property="og:image"');
    expect(indexHtml).toContain('name="twitter:card"');
    expect(indexHtml).toContain('rel="canonical"');
    expect(indexHtml).toContain('rel="icon"');
  });
});
