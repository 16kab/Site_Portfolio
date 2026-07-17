import { useEffect } from 'react';

const BASE_URL = 'https://alexiskabiche.com';

const DEFAULT_DESCRIPTION =
  "Portfolio d'Alexis Kabiche, Product & Brand Designer. Projets UX/UI, design d'applications métier et identité de marque.";

interface PageMetaProps {
  title: string;
  description?: string;
  /** Chemin canonique de la page, ex. « /projets » */
  path: string;
}

function setMeta(selector: string, attribute: string, value: string) {
  document.querySelector(selector)?.setAttribute(attribute, value);
}

/**
 * Met à jour le titre, la meta description, la canonical et les balises
 * Open Graph à chaque changement de route (SPA : une seule page HTML).
 */
export default function PageMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
}: PageMetaProps) {
  useEffect(() => {
    const url = `${BASE_URL}${path}`;

    document.title = title;
    setMeta('meta[name="description"]', 'content', description);
    setMeta('link[rel="canonical"]', 'href', url);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', url);
  }, [title, description, path]);

  return null;
}
