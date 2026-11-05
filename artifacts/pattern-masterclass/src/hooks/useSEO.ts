import { useEffect } from 'react';

export interface SEOProps {
  title: string;
  description?: string;
  canonicalPath?: string;
  type?: 'website' | 'article';
  image?: string;
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const DEFAULT_DESCRIPTION =
  'Master all 23 Gang of Four design patterns with interactive code playgrounds, AI architectural guidance, UML diagrams, and spaced-repetition quizzes.';
const DEFAULT_IMAGE = '/og-image.svg';

function updateMetaTag(selector: string, attribute: 'name' | 'property', attrValue: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attribute, attrValue);
    document.head.appendChild(el);
  }
  el.content = content;
}

function updateLinkTag(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function updateJsonLd(data?: Record<string, unknown> | Array<Record<string, unknown>>) {
  const SCRIPT_ID = 'seo-structured-data';
  let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

  if (!data) {
    if (script) script.remove();
    return;
  }

  if (!script) {
    script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(data);
}

/**
 * Universal SEO hook to manage dynamic title, meta descriptions, canonical URLs,
 * OpenGraph, Twitter Cards, and Schema.org JSON-LD structured data.
 */
export function useSEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalPath,
  type = 'website',
  image = DEFAULT_IMAGE,
  structuredData,
}: SEOProps) {
  useEffect(() => {
    // 1. Page Title
    const fullTitle = title.includes('GoF')
      ? title
      : `${title} | GoF Design Patterns Masterclass`;
    document.title = fullTitle;

    // 2. Primary Meta Description
    updateMetaTag('meta[name="description"]', 'name', 'description', description);

    // 3. Canonical URL
    const baseUrl = window.location.origin;
    const currentPath = canonicalPath || window.location.pathname;
    const fullCanonicalUrl = `${baseUrl}${currentPath}`;
    updateLinkTag('canonical', fullCanonicalUrl);

    // 4. OpenGraph Tags
    updateMetaTag('meta[property="og:title"]', 'property', 'og:title', fullTitle);
    updateMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    updateMetaTag('meta[property="og:type"]', 'property', 'og:type', type);
    updateMetaTag('meta[property="og:url"]', 'property', 'og:url', fullCanonicalUrl);
    updateMetaTag('meta[property="og:image"]', 'property', 'og:image', `${baseUrl}${image}`);

    // 5. Twitter Card Tags
    updateMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    updateMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', fullTitle);
    updateMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    updateMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', `${baseUrl}${image}`);

    // 6. JSON-LD Structured Data
    updateJsonLd(structuredData);
  }, [title, description, canonicalPath, type, image, structuredData]);
}

