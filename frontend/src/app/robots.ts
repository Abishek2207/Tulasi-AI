import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://tulasiai.vercel.app';
  
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/about',
        '/blog',
        '/contact',
        '/terms',
        '/privacy',
        '/security',
      ],
      disallow: ['/dashboard/', '/admin/', '/api/', '/_next/', '/static/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
