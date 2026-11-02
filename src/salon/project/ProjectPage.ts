import './project.css';
import { type Projet, projetsData } from '@/app/data/projetsData';
import type { Channel } from '../channels/ChannelManager';

/** Same content as the main site (src/app/data), so there is one source. */
const PROJECTS = new Map<string, Projet>(projetsData.map((p) => [p.id, p]));

/**
 * The project's accent colour, lightened toward warm white until it is
 * readable on the page's near-black background.
 */
function readableAccent(hex: string | undefined): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex ?? '');
  if (!match) return '#7dff86';
  const value = Number.parseInt(match[1], 16);
  let rgb = [(value >> 16) & 255, (value >> 8) & 255, value & 255];
  const paper = [243, 234, 216];
  const luminance = ([r, g, b]: number[]) =>
    (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  for (let i = 0; i < 10 && luminance(rgb) < 0.5; i++) {
    rgb = rgb.map((c, k) => Math.round(c + (paper[k] - c) * 0.2));
  }
  return `rgb(${rgb.join(', ')})`;
}

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * Turns the data's plain text into paragraphs and bullet lists
 * (blank lines separate blocks, "•" starts a list item).
 */
function richText(text: string): HTMLElement {
  const wrapper = element('div', 'project__text');
  for (const block of text.split(/\n\s*\n/)) {
    const lines = block.split('\n').map((line) => line.trim());
    if (lines.every((line) => line.startsWith('•'))) {
      const list = element('ul');
      for (const line of lines) {
        list.append(element('li', undefined, line.replace(/^•\s*/, '')));
      }
      wrapper.append(list);
    } else {
      wrapper.append(element('p', undefined, lines.join(' ')));
    }
  }
  return wrapper;
}

function section(title: string, body: HTMLElement): HTMLElement {
  const node = element('section', 'project__section');
  node.append(element('h2', 'project__label', title), body);
  return node;
}

/**
 * The project page, "inside the TV" (CLAUDE.md §4.6): the whole page wears
 * the CRT (tube corners, scanlines, flicker, grain), a permanent OSD shows
 * the channel, the video area comes first, then the project's story.
 * Opening and closing are CRT power on / off animations.
 */
export class ProjectPage {
  private readonly root: HTMLElement;
  private readonly scroller: HTMLElement;
  private readonly content: HTMLElement;
  private readonly osd: HTMLElement;
  private video: HTMLVideoElement | null = null;

  constructor(
    parent: HTMLElement,
    private readonly onBack: () => void,
  ) {
    this.root = element('div', 'project');
    this.root.hidden = true;
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'true');
    this.scroller = element('div', 'project__scroll');
    this.content = element('article', 'project__content');
    this.scroller.append(this.content);
    this.osd = element('div', 'project__osd');
    const crt = element('div', 'project__crt');
    crt.setAttribute('aria-hidden', 'true');
    const back = element('button', 'project__back', 'ÉCHAP — retour au canapé');
    back.type = 'button';
    back.addEventListener('click', () => this.onBack());
    this.root.append(this.scroller, crt, this.osd, back);
    parent.append(this.root);
  }

  /** Fills the page for a channel and plays the CRT power-on. */
  open(channel: Channel): void {
    const project = PROJECTS.get(channel.slug);
    const label = `CH ${String(channel.channel).padStart(2, '0')}`;
    this.osd.replaceChildren(
      element('span', 'project__osd-channel', label),
      element('span', 'project__osd-title', channel.title.toUpperCase()),
    );
    this.root.style.setProperty('--accent', readableAccent(project?.accent));
    this.build(channel, project);
    this.scroller.scrollTop = 0;
    this.root.hidden = false;
    this.root.classList.remove('is-off');
    // restart the animation
    void this.root.offsetWidth;
    this.root.classList.add('is-on');
    this.scroller.focus({ preventScroll: true });
    void this.video?.play().catch(() => undefined);
  }

  /** CRT power-off, then hides the page. */
  close(): Promise<void> {
    this.video?.pause();
    this.root.classList.remove('is-on');
    this.root.classList.add('is-off');
    return new Promise((resolve) => {
      window.setTimeout(() => {
        this.root.hidden = true;
        this.root.classList.remove('is-off');
        this.content.replaceChildren();
        this.video = null;
        resolve();
      }, 320);
    });
  }

  scrollBy(pixels: number): void {
    this.scroller.scrollBy({ top: pixels, behavior: 'smooth' });
  }

  scrollPage(direction: 1 | -1): void {
    this.scrollBy(direction * this.scroller.clientHeight * 0.8);
  }

  private build(channel: Channel, project: Projet | undefined): void {
    const content = this.content;
    content.replaceChildren();

    // 1. the video (the project's main image until the edit exists)
    const screen = element('figure', 'project__video');
    if (channel.video) {
      const video = element('video');
      video.src = channel.video;
      video.autoplay = true;
      video.loop = true;
      video.playsInline = true;
      video.controls = true;
      if (channel.poster) video.poster = channel.poster;
      this.video = video;
      screen.append(video);
    } else {
      if (project?.image) {
        const image = element('img');
        image.src = project.image;
        image.alt = '';
        screen.append(image);
      }
      screen.append(
        element('figcaption', 'project__soon', 'VIDÉO DU PROJET — BIENTÔT'),
      );
    }
    content.append(screen);

    // 2. title block
    const header = element('header', 'project__header');
    header.append(
      element('h1', 'project__title', project?.title ?? channel.title),
    );
    if (project?.subtitle) {
      header.append(element('p', 'project__subtitle', project.subtitle));
    }
    const meta = element('dl', 'project__meta');
    const facts: [string, string | undefined][] = [
      ['ANNÉE', project?.year ?? String(channel.year)],
      ['PRODUIT', project?.natureProduit],
      ['POUR', project?.utilisateurPrincipal],
    ];
    for (const [term, value] of facts) {
      if (!value) continue;
      meta.append(
        element('dt', undefined, term),
        element('dd', undefined, value),
      );
    }
    header.append(meta);
    if (project?.tags.length) {
      const tags = element('ul', 'project__tags');
      for (const tag of project.tags)
        tags.append(element('li', undefined, tag));
      header.append(tags);
    }
    content.append(header);

    if (!project) return;

    // 3. the story
    content.append(section('CONTEXTE', richText(project.contexte)));
    content.append(section('PROBLÉMATIQUE', richText(project.problematique)));
    const role = richText(project.role);
    if (project.interventions.length) {
      const list = element('ul', 'project__interventions');
      for (const item of project.interventions) {
        list.append(element('li', undefined, item));
      }
      role.append(list);
    }
    content.append(section('MON RÔLE', role));
    if (project.demarche?.length) {
      const steps = element('ol', 'project__steps');
      for (const step of project.demarche) {
        const item = element('li');
        item.append(
          element('h3', undefined, step.title),
          element('p', undefined, step.content),
        );
        steps.append(item);
      }
      content.append(section('DÉMARCHE', steps));
    }
    content.append(section('IMPACT', richText(project.impact)));

    if (project.gallery.length) {
      const gallery = element('div', 'project__gallery');
      for (const src of project.gallery) {
        const image = element('img');
        image.src = src;
        image.alt = '';
        image.loading = 'lazy';
        gallery.append(image);
      }
      content.append(section('IMAGES', gallery));
    }

    // 4. links out of the TV
    const links = element('nav', 'project__links');
    const full = element('a', undefined, 'Voir la fiche complète ↗');
    full.href = `/projets/${project.id}`;
    full.target = '_blank';
    full.rel = 'noopener';
    links.append(full);
    if (project.websiteUrl) {
      const site = element('a', undefined, 'Visiter le site ↗');
      site.href = project.websiteUrl;
      site.target = '_blank';
      site.rel = 'noopener';
      links.append(site);
    }
    if (project.pdfUrl) {
      const pdf = element('a', undefined, 'Ouvrir le PDF ↗');
      pdf.href = project.pdfUrl;
      pdf.target = '_blank';
      pdf.rel = 'noopener';
      links.append(pdf);
    }
    content.append(links);
  }
}
