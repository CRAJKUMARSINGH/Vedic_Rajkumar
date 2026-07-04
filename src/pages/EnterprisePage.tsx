// Week 84-88: Enterprise & White-Label Solutions Page
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';

const PLANS = [
  {
    name: 'Starter', nameHi: 'स्टार्टर', price: '₹999', period: '/month',
    features: ['All core features', '1,000 API calls/day', 'Basic white-label', 'Email support', '5 user accounts'],
    color: 'border-gray-200', badge: '',
  },
  {
    name: 'Professional', nameHi: 'प्रोफेशनल', price: '₹4,999', period: '/month',
    features: ['All features', '10,000 API calls/day', 'Full white-label', 'Priority support', '25 user accounts', 'Custom domain', 'PDF reports'],
    color: 'border-primary', badge: 'Most Popular',
  },
  {
    name: 'Enterprise', nameHi: 'एंटरप्राइज', price: 'Custom', period: '',
    features: ['Unlimited everything', 'Dedicated server', 'Custom integrations', '24/7 support', 'Unlimited users', 'SLA guarantee', 'Training included', 'Source code access'],
    color: 'border-purple-400', badge: 'Best Value',
  },
];

const USE_CASES = [
  { icon: '🏥', title: 'Hospitals & Wellness', desc: 'Integrate Ayurvedic astrology into patient wellness programs' },
  { icon: '💒', title: 'Marriage Bureaus', desc: 'Automated Kundali Milan for matrimonial platforms' },
  { icon: '📱', title: 'Mobile Apps', desc: 'Embed complete astrology engine into your app via API' },
  { icon: '🎓', title: 'Astrology Schools', desc: 'Teaching platform with student management and certifications' },
  { icon: '🏪', title: 'Astrologer Platforms', desc: 'White-label solution for astrologer consultation businesses' },
  { icon: '🌐', title: 'Portals & Websites', desc: 'Add astrology features to existing websites instantly' },
];

const EnterprisePage = () => {
  const [isHi, setIsHi] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', company: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <SEO title="Enterprise & White-Label Astrology Solutions" description="White-label Vedic astrology platform for businesses. API access, custom branding, enterprise support. Power your app with our astrology engine." keywords="white label astrology, astrology API, enterprise astrology, astrology platform business" canonical="/enterprise" />
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏢</span>
              <div>
                <h1 className={`text-xl font-bold ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'एंटरप्राइज समाधान' : 'Enterprise Solutions'}</h1>
                <p className="text-xs text-muted-foreground">{isHi ? 'व्हाइट-लेबल • API • कस्टम इंटीग्रेशन' : 'White-Label • API • Custom Integration'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/" className="text-sm text-primary underline underline-offset-2">{isHi ? 'होम' : 'Home'}</Link>
              <button onClick={() => setIsHi(h => !h)} className="text-xs border rounded px-2 py-1">{isHi ? 'EN' : 'हि'}</button>
            </div>
          </div>
        </header>

        <main className="container max-w-5xl mx-auto px-4 py-8 space-y-12">
          {/* Hero */}
          <div className="text-center space-y-4">
            <div className="text-5xl">🚀</div>
            <h2 className={`text-2xl font-bold ${isHi ? 'font-hindi' : ''}`}>
              {isHi ? 'अपने व्यवसाय में ज्योतिष की शक्ति जोड़ें' : 'Power Your Business with Vedic Astrology'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
              {isHi
                ? 'हमारे व्हाइट-लेबल प्लेटफॉर्म और API के साथ अपने ऐप, वेबसाइट या व्यवसाय में संपूर्ण वैदिक ज्योतिष इंजन जोड़ें।'
                : 'Add a complete Vedic astrology engine to your app, website, or business with our white-label platform and API. 500+ features, 9 languages, 99.9% uptime.'}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a href="#pricing" className="bg-primary text-primary-foreground px-6 py-2 rounded-lg text-sm font-medium">
                {isHi ? 'मूल्य देखें' : 'View Pricing'}
              </a>
              <a href="#contact" className="border px-6 py-2 rounded-lg text-sm font-medium hover:bg-muted">
                {isHi ? 'संपर्क करें' : 'Contact Sales'}
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { value: '500+', label: 'Features', labelHi: 'सुविधाएं' },
              { value: '9', label: 'Languages', labelHi: 'भाषाएं' },
              { value: '99.9%', label: 'Uptime', labelHi: 'अपटाइम' },
              { value: '<100ms', label: 'Response', labelHi: 'प्रतिक्रिया' },
            ].map(s => (
              <div key={s.label} className="bg-card border rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-primary">{s.value}</div>
                <div className="text-xs text-muted-foreground">{isHi ? s.labelHi : s.label}</div>
              </div>
            ))}
          </div>

          {/* Use Cases */}
          <div>
            <h3 className={`text-lg font-bold mb-4 ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'उपयोग के मामले' : 'Use Cases'}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {USE_CASES.map(uc => (
                <div key={uc.title} className="bg-card border rounded-xl p-4">
                  <div className="text-2xl mb-2">{uc.icon}</div>
                  <div className="font-semibold text-sm mb-1">{uc.title}</div>
                  <p className="text-xs text-muted-foreground">{uc.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div id="pricing">
            <h3 className={`text-lg font-bold mb-4 ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'मूल्य निर्धारण' : 'Pricing Plans'}</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {PLANS.map(plan => (
                <div key={plan.name} className={`bg-card border-2 rounded-xl p-5 relative ${plan.color}`}>
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-0.5 rounded-full">{plan.badge}</div>
                  )}
                  <div className="font-bold text-lg mb-1">{isHi ? plan.nameHi : plan.name}</div>
                  <div className="text-3xl font-bold text-primary mb-1">{plan.price}<span className="text-sm text-muted-foreground">{plan.period}</span></div>
                  <ul className="space-y-1.5 mt-4 mb-5">
                    {plan.features.map(f => <li key={f} className="text-sm flex items-center gap-2"><span className="text-green-500">✓</span>{f}</li>)}
                  </ul>
                  <a href="#contact" className="block w-full text-center border rounded-lg py-2 text-sm font-medium hover:bg-muted transition-colors">
                    {isHi ? 'शुरू करें' : 'Get Started'}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* API Features */}
          <div className="bg-card border rounded-xl p-6">
            <h3 className={`text-lg font-bold mb-4 ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'API विशेषताएं' : 'API Features'}</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {[
                { icon: '🔌', title: 'REST API', desc: 'Clean JSON REST API with comprehensive documentation' },
                { icon: '⚡', title: 'Fast Response', desc: '<100ms average response time globally' },
                { icon: '🔒', title: 'Secure', desc: 'API key auth, HTTPS, rate limiting, IP whitelisting' },
                { icon: '📊', title: '25+ Endpoints', desc: 'Birth chart, Dasha, Compatibility, Panchang, Yogas and more' },
                { icon: '🌍', title: '9 Languages', desc: 'All responses available in 9 Indian languages' },
                { icon: '📖', title: 'Full Docs', desc: 'Interactive documentation with code examples' },
              ].map(f => (
                <div key={f.title} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                  <span className="text-xl">{f.icon}</span>
                  <div><div className="font-medium">{f.title}</div><div className="text-xs text-muted-foreground">{f.desc}</div></div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Link to="/api-docs" className="text-sm text-primary underline underline-offset-2">
                {isHi ? 'API दस्तावेज़ देखें →' : 'View API Documentation →'}
              </Link>
            </div>
          </div>

          {/* Contact Form */}
          <div id="contact" className="bg-card border rounded-xl p-6">
            <h3 className={`text-lg font-bold mb-4 ${isHi ? 'font-hindi' : ''}`}>{isHi ? 'बिक्री से संपर्क करें' : 'Contact Sales'}</h3>
            {submitted ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">✅</div>
                <p className="font-semibold">{isHi ? 'धन्यवाद! हम जल्द संपर्क करेंगे।' : 'Thank you! We\'ll be in touch soon.'}</p>
              </div>
            ) : (
              <div className="space-y-3 max-w-lg">
                {[
                  { key: 'name', label: 'Name', labelHi: 'नाम', type: 'text' },
                  { key: 'email', label: 'Email', labelHi: 'ईमेल', type: 'email' },
                  { key: 'company', label: 'Company', labelHi: 'कंपनी', type: 'text' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs text-muted-foreground block mb-1">{isHi ? f.labelHi : f.label}</label>
                    <input type={f.type} value={contactForm[f.key as keyof typeof contactForm]}
                      onChange={e => setContactForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-background" />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">{isHi ? 'संदेश' : 'Message'}</label>
                  <textarea value={contactForm.message} onChange={e => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm bg-background resize-none h-24" />
                </div>
                <button onClick={() => setSubmitted(true)}
                  disabled={!contactForm.name || !contactForm.email}
                  className="bg-primary text-primary-foreground rounded-lg px-6 py-2 text-sm font-medium disabled:opacity-50">
                  {isHi ? 'भेजें' : 'Send Message'}
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default EnterprisePage;
