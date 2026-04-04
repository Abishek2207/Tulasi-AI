import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tulasiai.vercel.app';

  // These are your public, SEO-critical pages
  const routes = [
    '',
    '/about',
    '/blog',
    '/contact',
    '/terms',
    '/privacy',
    '/auth',
    '/security',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
