import { useEffect } from "react";

interface SeoOptions {
  title: string;
  description: string;
  image?: string;
  type?: "website" | "product";
  canonicalPath?: string;
  keywords?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | null;
}

const upsertMetaByName = (name: string, content: string) => {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const upsertMetaByProperty = (property: string, content: string) => {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const upsertCanonical = (href: string) => {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const upsertJsonLd = (payload: Record<string, unknown> | null | undefined) => {
  const scriptId = "app-seo-jsonld";
  const existing = document.getElementById(scriptId);
  if (!payload) {
    if (existing) existing.remove();
    return;
  }

  const script = existing || document.createElement("script");
  script.id = scriptId;
  script.setAttribute("type", "application/ld+json");
  script.textContent = JSON.stringify(payload);

  if (!existing) {
    document.head.appendChild(script);
  }
};

export const useSeo = ({
  title,
  description,
  image = "/assets/web-images/heroimg.png",
  type = "website",
  canonicalPath,
  keywords,
  noindex = false,
  jsonLd,
}: SeoOptions) => {
  useEffect(() => {
    document.title = title;

    const origin = window.location.origin;
    const path = canonicalPath || `${window.location.pathname}${window.location.search}`;
    const canonical = `${origin}${path.startsWith("/") ? path : `/${path}`}`;
    const imageUrl = image.startsWith("http") ? image : `${origin}${image}`;

    upsertMetaByName("description", description);
    if (keywords) upsertMetaByName("keywords", keywords);
    upsertMetaByName("robots", noindex ? "noindex,nofollow" : "index,follow");

    upsertMetaByProperty("og:title", title);
    upsertMetaByProperty("og:description", description);
    upsertMetaByProperty("og:type", type);
    upsertMetaByProperty("og:site_name", "Revive Roots Essential");
    upsertMetaByProperty("og:url", canonical);
    upsertMetaByProperty("og:image", imageUrl);
    upsertMetaByProperty("og:image:alt", "Revive Roots Essential product imagery");

    upsertMetaByName("twitter:card", "summary_large_image");
    upsertMetaByName("twitter:title", title);
    upsertMetaByName("twitter:description", description);
    upsertMetaByName("twitter:image", imageUrl);
    upsertMetaByName("twitter:image:alt", "Revive Roots Essential product imagery");

    upsertCanonical(canonical);
    upsertJsonLd(jsonLd);
  }, [title, description, image, type, canonicalPath, keywords, noindex, jsonLd]);
};
