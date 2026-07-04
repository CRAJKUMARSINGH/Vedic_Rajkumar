import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://gochar-phal.vercel.app';
const SITE_NAME = 'Vedic Rajkumar';
const DEFAULT_IMAGE = '/og-image.png';

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  structuredData?: object;
  noIndex?: boolean;
}

export const SEO = ({
  title,
  description = 'Free Vedic astrology with accurate Kundli, transit predictions, matchmaking, career guidance and more. Bilingual Hindi/English.',
  keywords = 'vedic astrology, kundli, horoscope, jyotish, birth chart, nakshatra, rashi, transit, gochar phal',
  canonical,
  ogImage = DEFAULT_IMAGE,
  structuredData,
  noIndex = false,
}: SEOProps) => {
  const siteTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : SITE_URL;
  const imageUrl = ogImage.startsWith('http') ? ogImage : `${SITE_URL}${ogImage}`;

  return (
    <Helmet>
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:locale:alternate" content="hi_IN" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* JSON-LD Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

// Pre-built structured data helpers
export const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: SITE_NAME,
  url: SITE_URL,
  description: 'Comprehensive Vedic astrology platform with free Kundli, horoscope, transit predictions and more.',
  applicationCategory: 'LifestyleApplication',
  operatingSystem: 'Web Browser',
  inLanguage: ['en', 'hi'],
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
};

export const faqSchema = (faqs: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(({ q, a }) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: a },
  })),
});

export default SEO;
