export const SITE_URL = 'https://charlie-bells.com';
export const SITE_NAME = 'Charlie Bells';
export const SITE_TAGLINE = 'American Made Decorative Bells & Home Accents';

/**
 * SEO-friendly slug from a product/category name.
 * "Boogie Men Bell" → "boogie-men-bell"
 */
export function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 120) || 'product';
}

export function productPathSlug(product) {
  if (!product) return 'product';
  if (product.slug) return product.slug;
  const base = slugify(product.name || `product-${product.id || ''}`);
  return product.id ? `${base}-${product.id}` : base;
}

/** Canonical product URL path, e.g. /product/boogie-men-bell */
export function productPath(product) {
  return `/product/${productPathSlug(product)}`;
}

export function absoluteUrl(path = '/') {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_URL}${clean}`;
}

export function categoryPath(category) {
  if (!category) return '/all-products';
  if (category.slug) return `/category/${category.slug}`;
  if (category.id) return `/category/${category.id}`;
  return '/all-products';
}

/**
 * Update document head for SEO / AEO / social preview without extra deps.
 */
export function setPageSeo({
  title,
  description,
  path = '/',
  image,
  type = 'website',
  noindex = false,
} = {}) {
  const fullTitle = title
    ? (title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`)
    : `${SITE_NAME} | ${SITE_TAGLINE}`;
  const desc = description || SITE_TAGLINE;
  const url = absoluteUrl(path);
  const imageUrl = image
    ? (image.startsWith('http') ? image : absoluteUrl(image))
    : absoluteUrl('/src/assets/images/faviconbells.png');

  document.title = fullTitle;

  const upsert = (selector, attrs) => {
    let el = document.head.querySelector(selector);
    if (!el) {
      el = document.createElement(attrs.property || attrs.name ? 'meta' : 'link');
      document.head.appendChild(el);
    }
    Object.entries(attrs).forEach(([key, value]) => {
      if (value != null) el.setAttribute(key, value);
    });
  };

  upsert('meta[name="description"]', { name: 'description', content: desc });
  upsert('meta[name="robots"]', {
    name: 'robots',
    content: noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
  });
  upsert('link[rel="canonical"]', { rel: 'canonical', href: url });

  upsert('meta[property="og:title"]', { property: 'og:title', content: fullTitle });
  upsert('meta[property="og:description"]', { property: 'og:description', content: desc });
  upsert('meta[property="og:url"]', { property: 'og:url', content: url });
  upsert('meta[property="og:type"]', { property: 'og:type', content: type });
  upsert('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME });
  upsert('meta[property="og:image"]', { property: 'og:image', content: imageUrl });

  upsert('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
  upsert('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle });
  upsert('meta[name="twitter:description"]', { name: 'twitter:description', content: desc });
  upsert('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl });
}

export function injectJsonLd(id, data) {
  let script = document.getElementById(id);
  if (!script) {
    script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

export function removeJsonLd(id) {
  document.getElementById(id)?.remove();
}
