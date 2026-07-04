/**
 * Advanced SEO Service
 * Phase 2 Week 29: Advanced SEO Optimization
 * Implements comprehensive SEO optimization for Vedic Rajkumar
 */

export interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  openGraph: {
    title: string;
    description: string;
    image: string;
    url: string;
    type: string;
    siteName: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    image: string;
  };
  jsonLd: any[];
  metaTags: {
    name: string;
    content: string;
  }[];
  linkTags: {
    rel: string;
    href: string;
    type?: string;
  }[];
}

export interface SEOAnalytics {
  pageViews: number;
  uniqueVisitors: number;
  totalVisitors: number;
  bounceRate: number;
  avgTimeOnPage: number;
  organicSearch: number;
  directTraffic: number;
  referralTraffic: number;
  socialTraffic: number;
  topPages: {
    url: string;
    views: number;
    avgTime: number;
  }[];
  topKeywords: {
    keyword: string;
    clicks: number;
    impressions: number;
    ctr: number;
  }[];
  crawlErrors: string[];
  pageSpeed: {
    desktop: number;
    mobile: number;
  };
  coreWebVitals: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
  };
}

export class AdvancedSEOService {
  private readonly baseUrl = 'https://vedic-rajkumar.vercel.app';
  private readonly siteName = 'Vedic Rajkumar';
  private readonly defaultImage = '/og-image.jpg';

  /**
   * Generate comprehensive SEO data for a page
   */
  generateSEOData(pageData: {
    path: string;
    title: string;
    description: string;
    content?: string;
    type?: 'website' | 'article' | 'product' | 'service';
    image?: string;
    keywords?: string[];
    author?: string;
    publishDate?: string;
    modifiedDate?: string;
    category?: string;
    tags?: string[];
  }): SEOData {
    const { path, title, description, content, type = 'website', image, keywords = [], author, publishDate, modifiedDate, category, tags = [] } = pageData;
    const url = `${this.baseUrl}${path}`;
    const fullTitle = `${title} | ${this.siteName}`;

    // Generate keywords from content if not provided
    const generatedKeywords = this.extractKeywords(content || '', title);
    const allKeywords = [...new Set([...keywords, ...generatedKeywords])];

    // Generate JSON-LD structured data
    const jsonLd = this.generateJsonLd({
      title: fullTitle,
      description,
      url,
      image: image || this.defaultImage,
      type,
      author,
      publishDate,
      modifiedDate,
      category,
      tags,
      content
    });

    // Generate meta tags
    const metaTags = [
      { name: 'description', content: description },
      { name: 'keywords', content: allKeywords.join(', ') },
      { name: 'author', content: author || this.siteName },
      { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
      { name: 'googlebot', content: 'index, follow' },
      { name: 'language', content: 'en' },
      { name: 'geo.region', content: 'IN' },
      { name: 'geo.placename', content: 'India' },
      { name: 'ICBM', content: '28.6139,77.2090' },
      { name: 'theme-color', content: '#8b5cf6' },
      { name: 'msapplication-TileColor', content: '#8b5cf6' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      { name: 'apple-mobile-web-app-title', content: this.siteName },
      { name: 'application-name', content: this.siteName },
      { name: 'msapplication-config', content: '/browserconfig.xml' },
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'mobile-web-app-capable', content: 'yes' }
    ];

    if (publishDate) {
      metaTags.push({ name: 'article:published_time', content: publishDate });
    }
    if (modifiedDate) {
      metaTags.push({ name: 'article:modified_time', content: modifiedDate });
    }
    if (category) {
      metaTags.push({ name: 'article:section', content: category });
    }
    tags.forEach(tag => {
      metaTags.push({ name: 'article:tag', content: tag });
    });

    // Generate link tags
    const linkTags = [
      { rel: 'canonical', href: url },
      { rel: 'alternate', href: url, type: 'application/json+oembed' },
      { rel: 'alternate', href: `${url}?amp=1`, type: 'text/html' },
      { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
      { rel: 'dns-prefetch', href: '//www.googletagmanager.com' },
      { rel: 'dns-prefetch', href: '//www.google-analytics.com' },
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://www.googletagmanager.com' },
      { rel: 'preload', href: '/fonts/inter-var.woff2', type: 'font/woff2' },
      { rel: 'manifest', href: '/manifest.json' },
      { rel: 'icon', href: '/favicon.ico' },
      { rel: 'icon', href: '/icon-192.png', type: 'image/png' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#8b5cf6' }
    ];

    return {
      title: fullTitle,
      description,
      keywords: allKeywords,
      canonical: url,
      openGraph: {
        title: fullTitle,
        description,
        image: image || this.defaultImage,
        url,
        type,
        siteName: this.siteName
      },
      twitter: {
        card: 'summary_large_image',
        title: fullTitle,
        description,
        image: image || this.defaultImage
      },
      jsonLd,
      metaTags,
      linkTags
    };
  }

  /**
   * Generate JSON-LD structured data
   */
  private generateJsonLd(data: {
    title: string;
    description: string;
    url: string;
    image: string;
    type: string;
    author?: string;
    publishDate?: string;
    modifiedDate?: string;
    category?: string;
    tags?: string[];
    content?: string;
  }): any[] {
    const jsonLd: any[] = [];

    // Organization data
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: this.siteName,
      url: this.baseUrl,
      logo: `${this.baseUrl}/logo.png`,
      description: 'World\'s most comprehensive Vedic astrology platform with accurate calculations, personalized predictions, and ancient wisdom.',
      foundingDate: '2026',
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'IN',
        addressLocality: 'Delhi',
        addressRegion: 'DL'
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        availableLanguage: ['English', 'Hindi']
      },
      sameAs: [
        'https://twitter.com/vedicrajkumar',
        'https://facebook.com/vedicrajkumar',
        'https://instagram.com/vedicrajkumar',
        'https://youtube.com/vedicrajkumar'
      ]
    });

    // Website data
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: this.siteName,
      url: this.baseUrl,
      description: 'Comprehensive Vedic astrology platform offering Kundli, transit predictions, matchmaking, and personalized guidance.',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${this.baseUrl}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    });

    // WebPage data
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: data.title,
      description: data.description,
      url: data.url,
      image: data.image,
      datePublished: data.publishDate,
      dateModified: data.modifiedDate,
      author: {
        '@type': 'Organization',
        name: data.author || this.siteName
      },
      publisher: {
        '@type': 'Organization',
        name: this.siteName,
        logo: {
          '@type': 'ImageObject',
          url: `${this.baseUrl}/logo.png`
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': data.url
      }
    });

    // Article data (if applicable)
    if (data.type === 'article' || data.category) {
      jsonLd.push({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: data.title,
        description: data.description,
        image: data.image,
        url: data.url,
        datePublished: data.publishDate,
        dateModified: data.modifiedDate,
        author: {
          '@type': 'Organization',
          name: data.author || this.siteName
        },
        publisher: {
          '@type': 'Organization',
          name: this.siteName,
          logo: {
            '@type': 'ImageObject',
            url: `${this.baseUrl}/logo.png`
          }
        },
        articleSection: data.category || 'Astrology',
        keywords: data.tags?.join(', ') || '',
        wordCount: data.content?.split(/\s+/).length || 0
      });
    }

    // Service data (if applicable)
    if (data.type === 'service') {
      jsonLd.push({
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: data.title,
        description: data.description,
        url: data.url,
        image: data.image,
        provider: {
          '@type': 'Organization',
          name: this.siteName
        },
        serviceType: 'Astrology Services',
        areaServed: {
          '@type': 'Country',
          name: 'India'
        },
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Astrology Services',
          itemListElement: [
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Kundli Analysis',
                description: 'Complete birth chart analysis with predictions'
              }
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Transit Predictions',
                description: 'Planetary transit analysis and predictions'
              }
            },
            {
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: 'Match Making',
                description: 'Compatibility analysis for relationships'
              }
            }
          ]
        }
      });
    }

    // FAQ data (if content contains FAQ)
    if (data.content?.includes('FAQ') || data.content?.includes('Q:')) {
      const faqItems = this.extractFAQItems(data.content);
      if (faqItems.length > 0) {
        jsonLd.push({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqItems.map(item => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer
            }
          }))
        });
      }
    }

    return jsonLd;
  }

  /**
   * Extract keywords from content
   */
  private extractKeywords(content: string, title: string): string[] {
    const keywords = new Set<string>();
    
    // Add title words
    title.toLowerCase().split(/\s+/).forEach(word => {
      if (word.length > 3) keywords.add(word);
    });

    // Extract important terms from content
    const importantTerms = [
      'vedic astrology', 'kundli', 'horoscope', 'birth chart', 'transit',
      'predictions', 'matchmaking', 'compatibility', 'planets', 'nakshatra',
      'rashi', 'dasha', 'yoga', 'remedies', 'pooja', 'mantra', 'gemstone',
      'numerology', 'palmistry', 'vastu', 'spiritual', 'jyotish', 'astrologer',
      'consultation', 'guidance', 'future', 'career', 'marriage', 'health',
      'finance', 'education', 'relationships', 'saturn', 'mars', 'jupiter',
      'venus', 'mercury', 'moon', 'sun', 'rahu', 'ketu'
    ];

    importantTerms.forEach(term => {
      if (content.toLowerCase().includes(term)) {
        keywords.add(term);
      }
    });

    // Extract single words from content (filter common words)
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'];
    
    content.toLowerCase().split(/\s+/).forEach(word => {
      if (word.length > 4 && !commonWords.includes(word)) {
        keywords.add(word);
      }
    });

    return Array.from(keywords).slice(0, 15); // Limit to 15 keywords
  }

  /**
   * Extract FAQ items from content
   */
  private extractFAQItems(content: string): { question: string; answer: string }[] {
    const faqItems: { question: string; answer: string }[] = [];
    
    // Match Q: and A: patterns
    const qaPattern = /Q:\s*([^?\n]+)\?\s*\nA:\s*([^\n]+)/g;
    let match;
    
    while ((match = qaPattern.exec(content)) !== null) {
      faqItems.push({
        question: match[1].trim(),
        answer: match[2].trim()
      });
    }

    return faqItems;
  }

  /**
   * Generate sitemap
   */
  generateSitemap(pages: { url: string; lastmod: string; changefreq: string; priority: number }[]): string {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${pages.map(page => `  <url>
    <loc>${this.baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
    
    return sitemap;
  }

  /**
   * Generate robots.txt
   */
  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /private/
Disallow: /*.json$
Disallow: /*?amp=1$

Sitemap: ${this.baseUrl}/sitemap.xml

# Crawl-delay: 1
# Request-rate: 1/1

User-agent: Googlebot
Allow: /
Crawl-delay: 0.5

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Slurp
Allow: /
Crawl-delay: 1

User-agent: DuckDuckBot
Allow: /
Crawl-delay: 1`;
  }

  /**
   * Generate SEO analytics (mock data)
   */
  getAnalytics(): SEOAnalytics {
    // Mock analytics data - in production, this would come from Google Analytics, Search Console, etc.
    return {
      pageViews: 125000,
      uniqueVisitors: 45000,
      totalVisitors: 45000,
      bounceRate: 35.2,
      avgTimeOnPage: 185, // seconds
      organicSearch: 68000,
      directTraffic: 32000,
      referralTraffic: 15000,
      socialTraffic: 10000,
      topPages: [
        { url: '/', views: 45000, avgTime: 220 },
        { url: '/kundli', views: 18000, avgTime: 195 },
        { url: '/matchmaking', views: 15000, avgTime: 180 },
        { url: '/transit', views: 12000, avgTime: 165 },
        { url: '/remedies', views: 8000, avgTime: 145 }
      ],
      topKeywords: [
        { keyword: 'free kundli', clicks: 1200, impressions: 15000, ctr: 8.0 },
        { keyword: 'vedic astrology', clicks: 980, impressions: 12000, ctr: 8.2 },
        { keyword: 'horoscope matching', clicks: 750, impressions: 9000, ctr: 8.3 },
        { keyword: 'transit predictions', clicks: 620, impressions: 8000, ctr: 7.8 },
        { keyword: 'birth chart analysis', clicks: 580, impressions: 7500, ctr: 7.7 }
      ],
      crawlErrors: [],
      pageSpeed: {
        desktop: 92,
        mobile: 88
      },
      coreWebVitals: {
        lcp: 1.8, // seconds
        fid: 45, // milliseconds
        cls: 0.05
      }
    };
  }

  /**
   * Generate SEO recommendations
   */
  getRecommendations(analytics: SEOAnalytics): string[] {
    const recommendations: string[] = [];

    if (analytics.bounceRate > 50) {
      recommendations.push('High bounce rate detected. Consider improving page content and user engagement.');
    }

    if (analytics.avgTimeOnPage < 120) {
      recommendations.push('Low average time on page. Enhance content quality and add interactive elements.');
    }

    if (analytics.pageSpeed.desktop < 85 || analytics.pageSpeed.mobile < 80) {
      recommendations.push('Page speed needs improvement. Optimize images, reduce server response time, and enable caching.');
    }

    if (analytics.coreWebVitals.lcp > 2.5) {
      recommendations.push('Largest Contentful Paint is slow. Optimize images and reduce server response time.');
    }

    if (analytics.coreWebVitals.fid > 100) {
      recommendations.push('First Input Delay is high. Reduce JavaScript execution time and enable lazy loading.');
    }

    if (analytics.coreWebVitals.cls > 0.1) {
      recommendations.push('Cumulative Layout Shift is high. Ensure proper image dimensions and avoid dynamic content shifts.');
    }

    if (analytics.organicSearch < analytics.totalVisitors * 0.5) {
      recommendations.push('Low organic search traffic. Focus on keyword optimization and content marketing.');
    }

    if (analytics.crawlErrors.length > 0) {
      recommendations.push('Crawl errors detected. Fix broken links and ensure proper server responses.');
    }

    return recommendations;
  }

  /**
   * Generate SEO report
   */
  generateReport(): string {
    const analytics = this.getAnalytics();
    const recommendations = this.getRecommendations(analytics);

    return `
# SEO Performance Report
Generated: ${new Date().toLocaleString()}

## Key Metrics
- **Page Views**: ${analytics.pageViews.toLocaleString()}
- **Unique Visitors**: ${analytics.uniqueVisitors.toLocaleString()}
- **Bounce Rate**: ${analytics.bounceRate}%
- **Avg Time on Page**: ${Math.round(analytics.avgTimeOnPage / 60)} minutes
- **Organic Search**: ${analytics.organicSearch.toLocaleString()} (${((analytics.organicSearch / analytics.pageViews) * 100).toFixed(1)}%)

## Traffic Sources
- **Organic Search**: ${analytics.organicSearch.toLocaleString()} (${((analytics.organicSearch / analytics.pageViews) * 100).toFixed(1)}%)
- **Direct Traffic**: ${analytics.directTraffic.toLocaleString()} (${((analytics.directTraffic / analytics.pageViews) * 100).toFixed(1)}%)
- **Referral Traffic**: ${analytics.referralTraffic.toLocaleString()} (${((analytics.referralTraffic / analytics.pageViews) * 100).toFixed(1)}%)
- **Social Traffic**: ${analytics.socialTraffic.toLocaleString()} (${((analytics.socialTraffic / analytics.pageViews) * 100).toFixed(1)}%)

## Top Pages
${analytics.topPages.map((page, index) => 
  `${index + 1}. ${page.url} - ${page.views.toLocaleString()} views (${Math.round(page.avgTime / 60)} min avg)`
).join('\n')}

## Top Keywords
${analytics.topKeywords.map((keyword, index) => 
  `${index + 1}. "${keyword.keyword}" - ${keyword.clicks} clicks, ${keyword.impressions} impressions (${keyword.ctr}% CTR)`
).join('\n')}

## Performance Metrics
- **Desktop Page Speed**: ${analytics.pageSpeed.desktop}/100
- **Mobile Page Speed**: ${analytics.pageSpeed.mobile}/100
- **Largest Contentful Paint**: ${analytics.coreWebVitals.lcp}s
- **First Input Delay**: ${analytics.coreWebVitals.fid}ms
- **Cumulative Layout Shift**: ${analytics.coreWebVitals.cls}

## Recommendations
${recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

## Summary
Overall SEO performance is ${analytics.pageSpeed.desktop > 85 && analytics.pageSpeed.mobile > 80 ? 'excellent' : 'good'}. 
Focus on the recommendations above to improve search rankings and user experience.
    `.trim();
  }
}

// Export singleton instance
export const advancedSEOService = new AdvancedSEOService();
