import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Menu, FlaskConical } from 'lucide-react';
import UserProfileDialog from './UserProfileDialog';
import DarkModeToggle from './DarkModeToggle';

/**
 * NAV_LINKS — Week 3 scope reduction + Labs dropdown.
 *
 * ACTIVE (4 core features + shell):
 *   Kundli, Prashna, Matchmaking, Panchang
 *
 * LABS: all other features are accessible via the "⚗ Labs" dropdown →
 *   renders as a link to /features (the All Features roadmap page).
 *   Routes still exist and work — they're just not promoted in the main nav.
 *
 * To graduate a feature: add it to CORE_NAV_LINKS and remove from Labs.
 */
const CORE_NAV_LINKS = [
  { href: '/horoscope',   label: 'Kundli',       labelHi: 'कुंडली',       badge: null,  group: 'core' },
  { href: '/prashna',     label: 'Prashna',       labelHi: 'प्रश्न',       badge: 'AI',  group: 'core' },
  { href: '/matchmaking', label: 'Kundli Milan',  labelHi: 'कुंडली मिलान', badge: null,  group: 'core' },
  { href: '/panchang',    label: 'Panchang',      labelHi: 'पंचांग',       badge: null,  group: 'core' },
];

// Keep the old constant name so any file that imports NAV_LINKS still works
const NAV_LINKS = CORE_NAV_LINKS;

interface NavigationProps {
  lang: 'en' | 'hi';
  onLangToggle: () => void;
}

export default function Navigation({ lang, onLangToggle }: NavigationProps) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isHi = lang === 'hi';

  return (
    <nav aria-label="Main navigation" className="sticky top-0 z-50 w-full border-b border-[hsl(var(--auspicious-accent)/0.3)] bg-gradient-to-r from-[#8B0000] via-[#B22222] to-[#8B0000] shadow-lg">
      <div className="max-w-screen-2xl mx-auto px-4 flex h-14 items-center gap-4">
        {/* Logo — routes to /app workspace so users aren't kicked back to marketing */}
        <Link
          to="/app"
          className="flex items-center gap-2 font-serif font-bold text-white text-lg shrink-0 group"
          aria-label={isHi ? 'वैदिक राजकुमार मुख्य पृष्ठ' : 'Vedic Rajkumar Home Workspace'}
        >
          <span className="text-2xl group-hover:scale-110 transition-transform" aria-hidden="true">🪔</span>
          <span className="hidden sm:inline tracking-wide drop-shadow-sm">
            {isHi ? 'वैदिक राजकुमार' : 'Vedic Rajkumar'}
          </span>
          <span className="text-xs text-[hsl(var(--auspicious-accent))] opacity-70" aria-hidden="true">✦</span>
        </Link>

        {/* Desktop nav */}
        <div className="flex-1 overflow-x-auto hidden md:flex">
          <div className="flex gap-1 min-w-max items-center" role="menubar">
            {CORE_NAV_LINKS.map((l, idx) => {
              const prevGroup = idx > 0 ? CORE_NAV_LINKS[idx - 1].group : l.group;
              const showDivider = idx > 0 && l.group !== prevGroup;
              const isCurrent = location.pathname === l.href;
              return (
                <React.Fragment key={l.href}>
                  {showDivider && (
                    <span className="h-4 w-px bg-white/20 mx-1 shrink-0" aria-hidden="true" />
                  )}
                  <Link to={l.href} aria-current={isCurrent ? 'page' : undefined}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`relative text-xs px-2.5 text-white/90 hover:text-white hover:bg-white/10 ${isCurrent ? 'bg-white/20 text-white font-bold' : ''} ${isHi ? 'font-hindi' : ''}`}
                    >
                      {isHi ? l.labelHi : l.label}
                      {l.badge && (
                        <Badge className="ml-1 px-1 py-0 text-[9px] bg-[hsl(var(--auspicious-accent))] text-[#8B0000] border-none font-bold">
                          {l.badge}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                </React.Fragment>
              );
            })}

            {/* Labs → /features (all preview modules) */}
            <span className="h-4 w-px bg-white/20 mx-1 shrink-0" aria-hidden="true" />
            <Link to="/features" aria-label={isHi ? 'प्रयोगशाला — सभी प्रीव्यू मॉड्यूल' : 'Labs — all preview modules'}>
              <Button
                variant="ghost"
                size="sm"
                className={`relative text-xs px-2.5 text-white/70 hover:text-white hover:bg-white/10 ${location.pathname === '/features' ? 'bg-white/20 text-white font-bold' : ''}`}
              >
                <FlaskConical className="h-3 w-3 mr-1 opacity-80" aria-hidden="true" />
                {isHi ? 'लैब्स' : 'Labs'}
                <Badge className="ml-1 px-1 py-0 text-[9px] bg-white/20 text-white/90 border-none">
                  {isHi ? 'प्रीव्यू' : 'Preview'}
                </Badge>
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto shrink-0">
          {/* Language toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={onLangToggle}
            className="text-xs font-bold border-white/30 text-white hover:bg-white/10 hover:text-white"
            aria-label={isHi ? 'Switch to English language' : 'हिंदी भाषा में बदलें'}
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
                aria-label={isHi ? 'नेविगेशन मेनू खोलें' : 'Open navigation menu'}
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
                {/* Core 4 */}
                <p className={`text-[10px] uppercase tracking-wider text-[#8B0000]/50 font-semibold px-2 pt-1 ${isHi ? 'font-hindi' : ''}`}>
                  {isHi ? 'मुख्य टूल्स' : 'Core tools'}
                </p>
                {CORE_NAV_LINKS.map((l) => (
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

                {/* Labs link */}
                <hr className="border-[#8B0000]/10 my-1" />
                <Link to="/features" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" className={`w-full justify-start text-sm text-[#5D4037] ${isHi ? 'font-hindi' : ''}`}>
                    <FlaskConical className="h-3.5 w-3.5 mr-2 opacity-60" aria-hidden="true" />
                    {isHi ? 'लैब्स — प्रीव्यू मॉड्यूल' : 'Labs — preview modules'}
                    <Badge className="ml-auto px-1.5 py-0 text-[9px] bg-slate-200 text-slate-600">
                      {isHi ? 'प्रीव्यू' : 'Preview'}
                    </Badge>
                  </Button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
