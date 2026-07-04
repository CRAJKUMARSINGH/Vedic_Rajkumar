import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Menu } from 'lucide-react';
import UserProfileDialog from './UserProfileDialog';
import DarkModeToggle from './DarkModeToggle';

const NAV_LINKS = [
  { href: '/', label: 'Home', labelHi: 'होम' },
  { href: '/app', label: '⚡ Workspace', labelHi: '⚡ वर्कस्पेस', badge: 'App' },
  { href: '/horoscope', label: 'Kundli', labelHi: 'कुंडली' },
  { href: '/dynamic-transit', label: 'Transit', labelHi: 'गोचर' },
  { href: '/transit-analysis', label: 'Transit Analysis', labelHi: 'गोचर विश्लेषण', badge: 'New' },
  { href: '/dasha', label: 'Dasha', labelHi: 'दशा' },
  { href: '/ashtakavarga', label: 'Ashtakavarga', labelHi: 'अष्टकवर्ग' },
  { href: '/bv-raman', label: 'BV Raman', labelHi: 'BV रमण', badge: 'New' },
  { href: '/varshaphal', label: 'Varshaphal', labelHi: 'वार्षफल' },
  { href: '/yogas', label: 'Yogas', labelHi: 'योग' },
  { href: '/sade-sati', label: 'Sade Sati', labelHi: 'साढ़े साती' },
  { href: '/kaalsarp', label: 'Kaal Sarp', labelHi: 'काल सर्प' },
  { href: '/remedies', label: 'Remedies', labelHi: 'उपाय' },
  { href: '/panchang', label: 'Panchang', labelHi: 'पंचांग' },
  { href: '/matchmaking', label: 'Match', labelHi: 'मिलान' },
  { href: '/numerology', label: 'Numerology', labelHi: 'अंकज्योतिष' },
  { href: '/career-astrology', label: 'Career', labelHi: 'करियर' },
  { href: '/divisional-charts', label: 'D-Charts', labelHi: 'विभागीय' },
  { href: '/muhurat', label: 'Muhurat', labelHi: 'मुहूर्त' },
  { href: '/ai-predictions', label: 'AI Predictions', labelHi: 'AI भविष्यवाणी', badge: 'AI' },
  {
    href: '/marriage',
    label: '💍 MTSS — Marriage & Spouse',
    labelHi: '💍 MTSS — विवाह',
    badge: 'Pro',
  },
  { href: '/mtss', label: 'MTSS', labelHi: 'MTSS' },
  { href: '/vedic-marriage', label: 'Vedic Marriage', labelHi: 'वैदिक विवाह', badge: 'Pro' },
  { href: '/vidhya-karma', label: 'Vidhya-Karma', labelHi: 'विद्या-कर्म', badge: 'New' },
  { href: '/kundli-compare', label: 'Kundli Milan', labelHi: 'कुंडली मिलान', badge: 'New' },
  { href: '/wedding-muhurat', label: 'Wedding Muhurat', labelHi: 'विवाह मुहूर्त', badge: 'New' },
  { href: '/dasha-timeline', label: 'Dasha Timeline', labelHi: 'दशा टाइमलाइन', badge: 'New' },
  { href: '/nakshatra-precautions', label: 'Precautions', labelHi: 'सावधानियां', badge: 'New' },
  { href: '/enterprise', label: 'Enterprise', labelHi: 'एंटरप्राइज' },
  { href: '/prashna', label: 'Prasna', labelHi: 'प्रश्न' },
  { href: '/prashna-ai', label: 'Prashna AI Engine', labelHi: 'प्रश्न AI इंजन', badge: 'AI' },
  { href: '/knowledge', label: 'Knowledge', labelHi: 'ज्ञान', badge: 'New' },
];

interface NavigationProps {
  lang: 'en' | 'hi';
  onLangToggle: () => void;
}

export default function Navigation({ lang, onLangToggle }: NavigationProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHi = lang === 'hi';

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-[hsl(var(--auspicious-accent)/0.3)] bg-gradient-to-r from-[#8B0000] via-[#B22222] to-[#8B0000] shadow-lg">
      <div className="max-w-screen-2xl mx-auto px-4 flex h-14 items-center gap-4">
        {/* Logo — routes to /app workspace so users aren't kicked back to marketing */}
        <Link
          to="/app"
          className="flex items-center gap-2 font-serif font-bold text-white text-lg shrink-0 group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">🪔</span>
          <span className="hidden sm:inline tracking-wide drop-shadow-sm">
            {isHi ? 'वैदिक राजकुमार' : 'Vedic Rajkumar'}
          </span>
          <span className="text-xs text-[hsl(var(--auspicious-accent))] opacity-70">✦</span>
        </Link>

        {/* Desktop nav — scrollable */}
        <div className="flex-1 overflow-x-auto hidden md:flex">
          <div className="flex gap-1 min-w-max">
            {NAV_LINKS.map(l => (
              <Link key={l.href} to={l.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`relative text-xs px-2.5 text-white/90 hover:text-white hover:bg-white/10 ${location.pathname === l.href ? 'bg-white/20 text-white font-bold' : ''} ${isHi ? 'font-hindi' : ''}`}
                >
                  {isHi ? l.labelHi : l.label}
                  {l.badge && (
                    <Badge className="ml-1 px-1 py-0 text-[9px] bg-[hsl(var(--auspicious-accent))] text-[#8B0000] border-none font-bold">
                      {l.badge}
                    </Badge>
                  )}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto shrink-0">
          {/* Language toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={onLangToggle}
            className="text-xs font-bold border-white/30 text-white hover:bg-white/10 hover:text-white"
          >
            {isHi ? 'EN' : 'हिं'}
          </Button>
          {/* User Profile */}
          <UserProfileDialog lang={isHi ? 'hi' : 'en'} />
          {/* Dark mode */}
          <div className="bg-white/10 rounded-lg">
            <DarkModeToggle language={isHi ? 'hi' : 'en'} showLabel={false} />
          </div>
          {/* Mobile menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8 text-white hover:bg-white/10"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-[#FFF5E6]">
              <div className="flex items-center gap-2 p-4 border-b border-[#8B0000]/10 bg-gradient-to-r from-[#8B0000] to-[#B22222] text-white">
                <span className="text-2xl">🪔</span>
                <span className="font-serif font-bold tracking-wide">Vedic Rajkumar</span>
              </div>
              <div className="flex flex-col gap-1 p-3 overflow-y-auto max-h-[calc(100vh-80px)]">
                {NAV_LINKS.map(l => (
                  <Link key={l.href} to={l.href} onClick={() => setMobileOpen(false)}>
                    <Button
                      variant={location.pathname === l.href ? 'secondary' : 'ghost'}
                      className={`w-full justify-start text-sm ${location.pathname === l.href ? 'bg-[#8B0000]/10 text-[#8B0000]' : 'text-[#5D4037]'} ${isHi ? 'font-hindi' : ''}`}
                    >
                      {isHi ? l.labelHi : l.label}
                      {l.badge && (
                        <Badge className="ml-auto px-1.5 py-0 text-[9px] bg-[#C05000] text-white">
                          {l.badge}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
