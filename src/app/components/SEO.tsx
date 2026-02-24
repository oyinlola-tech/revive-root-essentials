import { useEffect } from 'react';

const SITE_NAME = (import.meta.env.VITE_SITE_NAME as string | undefined)?.trim();
const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '');

type SEOProps = {
  title: string;
  description: string;
  image?: string;
  type?: 'website' | 'product' | 'article';
  canonicalPath?: string;
  keywords?: string;
  jsonLd?: Record<string, any>;
  noIndex?: boolean;
};

const upsertMeta = (selector: string, attribute: 'name' | 'property', value: string) => {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${selector}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, selector);
    document.head.appendChild(element);
  }
  element.setAttribute('content', value);
};

const removeMeta = (selector: string, attribute: 'name' | 'property') => {
  const element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${selector}"]`);
  if (element) element.remove();
};

export function SEO({
  title,
  description,
  image,
  type = 'website',
  canonicalPath = '/',
  keywords,
  jsonLd,
  noIndex = false,
}: SEOProps) {
  useEffect(() => {
    const fullTitle = SITE_NAME ? `${title} | ${SITE_NAME}` : title;
    const origin = SITE_URL || window.location.origin;
    const canonical = canonicalPath.startsWith('http') ? canonicalPath : `${origin}${canonicalPath}`;
    const resolvedImage = image
      ? (image.startsWith('http') ? image : `${origin}${image.startsWith('/') ? image : `/${image}`}`)
      : undefined;
    const robots = noIndex ? 'noindex, nofollow, noarchive' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

    document.title = fullTitle;
    upsertMeta('description', 'name', description);
    upsertMeta('robots', 'name', robots);
    upsertMeta('googlebot', 'name', robots);
    upsertMeta('author', 'name', SITE_NAME || 'Revive Roots Essentials');
    if (keywords) {
      upsertMeta('keywords', 'name', keywords);
    } else {
      removeMeta('keywords', 'name');
    }
    upsertMeta('og:title', 'property', fullTitle);
    upsertMeta('og:description', 'property', description);
    upsertMeta('og:type', 'property', type);
    upsertMeta('og:url', 'property', canonical);
    upsertMeta('og:site_name', 'property', SITE_NAME || 'Revive Roots Essentials');
    upsertMeta('og:locale', 'property', 'en_US');
    upsertMeta('twitter:title', 'name', fullTitle);
    upsertMeta('twitter:description', 'name', description);
    upsertMeta('twitter:url', 'name', canonical);

    if (resolvedImage) {
      upsertMeta('og:image', 'property', resolvedImage);
      upsertMeta('twitter:image', 'name', resolvedImage);
      upsertMeta('twitter:card', 'name', 'summary_large_image');
    } else {
      removeMeta('og:image', 'property');
      removeMeta('twitter:image', 'name');
      upsertMeta('twitter:card', 'name', 'summary');
    }

    let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical);

    let jsonLdTag = document.head.querySelector<HTMLScriptElement>('script[data-seo-jsonld="true"]');
    if (jsonLdTag) jsonLdTag.remove();
    if (jsonLd && !noIndex) {
      jsonLdTag = document.createElement('script');
      jsonLdTag.type = 'application/ld+json';
      jsonLdTag.dataset.seoJsonld = 'true';
      jsonLdTag.text = JSON.stringify(jsonLd);
      document.head.appendChild(jsonLdTag);
    }

    return () => {
      if (jsonLdTag && jsonLdTag.parentNode) {
        jsonLdTag.parentNode.removeChild(jsonLdTag);
      }
    };
  }, [title, description, image, type, canonicalPath, keywords, jsonLd, noIndex]);

  return null;
}
