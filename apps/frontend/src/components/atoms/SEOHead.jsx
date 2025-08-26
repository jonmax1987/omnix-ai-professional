import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SEOHead = ({
  title,
  description,
  keywords = [],
  image,
  type = 'website',
  author = 'OMNIX AI Team',
  publishedTime,
  modifiedTime,
  canonical,
  noindex = false,
  nofollow = false,
  structuredData
}) => {
  const location = useLocation();
  
  // Default values from environment
  const defaultTitle = import.meta.env.VITE_SITE_NAME || 'OMNIX AI';
  const defaultDescription = import.meta.env.VITE_SITE_DESCRIPTION || 'Smart inventory management system with AI-powered insights';
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://omnix-ai.com';
  const defaultImage = import.meta.env.VITE_SITE_IMAGE || `${siteUrl}/og-image.jpg`;
  const twitterHandle = import.meta.env.VITE_TWITTER_HANDLE || '@omnixai';
  const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID;
  
  // Generate full title
  const fullTitle = title ? `${title} | ${defaultTitle}` : defaultTitle;
  
  // Generate canonical URL
  const canonicalUrl = canonical || `${siteUrl}${location.pathname}`;
  
  // Generate image URL
  const imageUrl = image || defaultImage;
  
  // Generate robots meta
  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow'
  ].join(', ');
  
  // Keywords string
  const keywordsString = keywords.length > 0 ? keywords.join(', ') : 
    'inventory management, AI, machine learning, supply chain, stock management, business intelligence';
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywordsString} />
      <meta name="author" content={author} />
      <meta name="robots" content={robotsContent} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={defaultTitle} />
      <meta property="og:locale" content="en_US" />
      
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {author && <meta property="article:author" content={author} />}
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      
      {/* Facebook Tags */}
      {facebookAppId && <meta property="fb:app_id" content={facebookAppId} />}
      
      {/* Additional Meta Tags */}
      <meta name="theme-color" content="#3b82f6" />
      <meta name="msapplication-TileColor" content="#3b82f6" />
      <meta name="apple-mobile-web-app-title" content={defaultTitle} />
      <meta name="application-name" content={defaultTitle} />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

// Common structured data schemas
export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "OMNIX AI",
  "url": import.meta.env.VITE_SITE_URL,
  "logo": `${import.meta.env.VITE_SITE_URL}/logo.png`,
  "description": import.meta.env.VITE_SITE_DESCRIPTION,
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "email": "support@omnix-ai.com"
  },
  "sameAs": [
    `https://twitter.com/${import.meta.env.VITE_TWITTER_HANDLE?.replace('@', '')}`,
    "https://linkedin.com/company/omnix-ai"
  ]
});

export const generateWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": import.meta.env.VITE_SITE_NAME,
  "url": import.meta.env.VITE_SITE_URL,
  "description": import.meta.env.VITE_SITE_DESCRIPTION,
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${import.meta.env.VITE_SITE_URL}/products?search={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
});

export const generateSoftwareApplicationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "OMNIX AI",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "description": import.meta.env.VITE_SITE_DESCRIPTION,
  "url": import.meta.env.VITE_SITE_URL,
  "screenshot": `${import.meta.env.VITE_SITE_URL}/screenshot.jpg`,
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "127"
  },
  "offers": {
    "@type": "Offer",
    "category": "SaaS",
    "priceCurrency": "USD"
  }
});

export const generateBreadcrumbSchema = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": `${import.meta.env.VITE_SITE_URL}${item.url}`
  }))
});

export const generateArticleSchema = ({ title, description, author, publishedTime, modifiedTime, image }) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": title,
  "description": description,
  "author": {
    "@type": "Person",
    "name": author
  },
  "publisher": {
    "@type": "Organization",
    "name": import.meta.env.VITE_SITE_NAME,
    "logo": {
      "@type": "ImageObject",
      "url": `${import.meta.env.VITE_SITE_URL}/logo.png`
    }
  },
  "datePublished": publishedTime,
  "dateModified": modifiedTime,
  "image": {
    "@type": "ImageObject",
    "url": image,
    "width": 1200,
    "height": 630
  }
});

export const generateFAQSchema = (questions) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": questions.map(q => ({
    "@type": "Question",
    "name": q.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": q.answer
    }
  }))
});

export default SEOHead;