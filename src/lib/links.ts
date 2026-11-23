const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function isExternal(href: string) {
  return /^(https?:|mailto:|tel:)/.test(href);
}

/** Site-relative path ("/parishes/") to a language path ("/ru/parishes/"). Next's Link adds the base path. */
export function localHref(lang: string, href: string) {
  if (isExternal(href) || href.startsWith("#")) return href;
  const clean = href.startsWith("/") ? href : `/${href}`;
  return `/${lang}${clean === "/" ? "/" : clean}`;
}

/** Path to a file in /public. Plain <img> and <a download> need the base path added by hand. */
export function asset(path: string) {
  if (!path || isExternal(path)) return path;
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
}
