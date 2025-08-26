import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

// SEO hook for managing page-specific SEO data
export function useSEO(seoData = {}) {
  const location = useLocation();
  const [currentSEO, setCurrentSEO] = useState(seoData);

  useEffect(() => {
    setCurrentSEO(seoData);
  }, [seoData]);

  const updateSEO = (newSEOData) => {
    setCurrentSEO(prev => ({ ...prev, ...newSEOData }));
  };

  return { currentSEO, updateSEO };
}

// Hook for generating page-specific SEO data based on route
export function useRouteSEO() {
  const location = useLocation();
  
  const getRouteBasedSEO = () => {
    const path = location.pathname;
    
    // Define SEO data for different routes
    const routeSEOMap = {
      '/': {
        title: 'Dashboard',
        description: 'Smart inventory management dashboard with AI-powered insights and real-time analytics',
        keywords: ['dashboard', 'inventory', 'analytics', 'real-time'],
        type: 'website'
      },
      '/products': {
        title: 'Products',
        description: 'Manage your product inventory with advanced filtering, search, and bulk operations',
        keywords: ['products', 'inventory management', 'stock', 'catalog'],
        type: 'website'
      },
      '/settings': {
        title: 'Settings',
        description: 'Configure your OMNIX AI settings, preferences, and account details',
        keywords: ['settings', 'configuration', 'preferences'],
        type: 'website',
        noindex: true // Don't index settings pages
      },
      '/analytics': {
        title: 'Analytics',
        description: 'Advanced analytics and reporting for inventory performance and trends',
        keywords: ['analytics', 'reports', 'business intelligence', 'insights'],
        type: 'website'
      },
      '/alerts': {
        title: 'Alerts',
        description: 'Real-time alerts and notifications for inventory management',
        keywords: ['alerts', 'notifications', 'monitoring'],
        type: 'website'
      }
    };

    // Check for dynamic routes
    if (path.startsWith('/products/')) {
      const productId = path.split('/')[2];
      return {
        title: `Product ${productId}`,
        description: `Detailed view and management of product ${productId}`,
        keywords: ['product', 'details', 'inventory'],
        type: 'product'
      };
    }

    return routeSEOMap[path] || {
      title: 'Page',
      description: 'OMNIX AI - Smart inventory management system',
      keywords: ['inventory', 'management', 'AI'],
      type: 'website'
    };
  };

  return getRouteBasedSEO();
}

// Hook for breadcrumb generation
export function useBreadcrumbs() {
  const location = useLocation();
  
  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    
    const breadcrumbs = [
      { name: 'Home', url: '/' }
    ];

    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Convert segment to readable name
      const segmentNames = {
        'products': 'Products',
        'settings': 'Settings',
        'analytics': 'Analytics',
        'alerts': 'Alerts',
        'recommendations': 'Recommendations'
      };

      breadcrumbs.push({
        name: segmentNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        url: currentPath
      });
    });

    return breadcrumbs;
  };

  return getBreadcrumbs();
}

// Hook for sitemap generation (client-side)
export function useSitemap() {
  const [sitemap, setSitemap] = useState([]);

  useEffect(() => {
    // Define all public routes for sitemap
    const routes = [
      {
        url: '/',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: '1.0'
      },
      {
        url: '/products',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: '0.8'
      },
      {
        url: '/analytics',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.7'
      },
      {
        url: '/alerts',
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: 'daily',
        priority: '0.6'
      }
    ];

    setSitemap(routes);
  }, []);

  const generateSitemapXML = () => {
    const siteUrl = import.meta.env.VITE_SITE_URL || 'https://omnix-ai.com';
    
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap.map(route => `
  <url>
    <loc>${siteUrl}${route.url}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('')}
</urlset>`;

    return xml;
  };

  return { sitemap, generateSitemapXML };
}

// Hook for robots.txt generation
export function useRobotsTxt() {
  const generateRobotsTxt = () => {
    const siteUrl = import.meta.env.VITE_SITE_URL || 'https://omnix-ai.com';
    
    return `User-agent: *
Allow: /
Disallow: /settings
Disallow: /api/
Disallow: /admin/
Disallow: *.json$

# Crawl delay
Crawl-delay: 1

# Sitemap
Sitemap: ${siteUrl}/sitemap.xml

# Popular search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /`;
  };

  return { generateRobotsTxt };
}

// Hook for Open Graph image generation
export function useOGImage() {
  const generateOGImageUrl = (title, description) => {
    // If you have a service for generating OG images dynamically
    const baseUrl = import.meta.env.VITE_OG_IMAGE_SERVICE || '';
    
    if (!baseUrl) {
      return import.meta.env.VITE_SITE_IMAGE;
    }

    const params = new URLSearchParams({
      title,
      description: description?.substring(0, 100) + '...',
      theme: 'omnix-ai'
    });

    return `${baseUrl}/og-image?${params.toString()}`;
  };

  return { generateOGImageUrl };
}

// Hook for structured data management
export function useStructuredData() {
  const [structuredData, setStructuredData] = useState(null);

  const addStructuredData = (data) => {
    setStructuredData(prev => {
      if (Array.isArray(prev)) {
        return [...prev, data];
      } else if (prev) {
        return [prev, data];
      } else {
        return data;
      }
    });
  };

  const clearStructuredData = () => {
    setStructuredData(null);
  };

  return {
    structuredData,
    addStructuredData,
    clearStructuredData
  };
}

// Hook for monitoring SEO performance
export function useSEOAnalytics() {
  const location = useLocation();

  const trackSEOEvent = (event, data = {}) => {
    // Track SEO-related events
    if (typeof analytics !== 'undefined') {
      analytics.trackEvent(`seo_${event}`, {
        page: location.pathname,
        ...data,
        category: 'SEO'
      });
    }
  };

  const trackPageLoad = (loadTime) => {
    trackSEOEvent('page_load', { load_time: loadTime });
  };

  const trackMetaTagsGenerated = (metaTags) => {
    trackSEOEvent('meta_tags_generated', { 
      tags_count: Object.keys(metaTags).length,
      has_description: !!metaTags.description,
      has_keywords: !!metaTags.keywords,
      has_og_image: !!metaTags.image
    });
  };

  const trackStructuredDataAdded = (type) => {
    trackSEOEvent('structured_data_added', { schema_type: type });
  };

  return {
    trackSEOEvent,
    trackPageLoad,
    trackMetaTagsGenerated,
    trackStructuredDataAdded
  };
}

export default {
  useSEO,
  useRouteSEO,
  useBreadcrumbs,
  useSitemap,
  useRobotsTxt,
  useOGImage,
  useStructuredData,
  useSEOAnalytics
};