import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const indexHtml = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');

describe('Safari chrome initialization', () => {
  it('uses the application dark default before React starts', () => {
    expect(indexHtml).toContain(
      '<meta name="theme-color" content="#111111" />',
    );
    expect(indexHtml).toContain("const isDark = theme !== 'light';");
    expect(indexHtml).not.toContain('prefersDark');
  });

  it('enables the translucent Apple standalone status bar', () => {
    expect(indexHtml).toContain(
      '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />',
    );
  });
});
