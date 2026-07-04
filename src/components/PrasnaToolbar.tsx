/**
 * PrasnaToolbar.tsx
 *
 * Top-of-app quick-action toolbar as specified in the Master Prompt.
 * Provides one-click routing to the 10 most-used Prasna / astrology modes.
 *
 * Buttons:
 *   Birth Chart | Prasna Question | Marriage | Career | Timing |
 *   Lost Item   | Court Case      | Remedies | Research Mode | Ask Anything
 *
 * Each button navigates to the relevant page, optionally pre-seeding a
 * question category via URL search params so QuestionPage / HoraryPage
 * can auto-fill the category selector.
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star,
  HelpCircle,
  Heart,
  Briefcase,
  Clock,
  Search,
  Scale,
  Sparkles,
  BookOpen,
  MessageCircle,
} from 'lucide-react';

interface ToolbarButton {
  id: string;
  icon: React.ReactNode;
  labelEn: string;
  labelHi: string;
  route: string;
  color: string;
  hoverColor: string;
  borderColor: string;
  category?: string; // passed as ?category= to QuestionPage
}

const TOOLBAR_BUTTONS: ToolbarButton[] = [
  {
    id: 'birth-chart',
    icon: <Star className="w-4 h-4" />,
    labelEn: 'Birth Chart',
    labelHi: 'जन्म कुंडली',
    route: '/',
    color: 'text-amber-700',
    hoverColor: 'hover:bg-amber-100',
    borderColor: 'border-amber-300',
  },
  {
    id: 'prasna',
    icon: <HelpCircle className="w-4 h-4" />,
    labelEn: 'Prasna Question',
    labelHi: 'प्रश्न',
    route: '/question',
    color: 'text-orange-700',
    hoverColor: 'hover:bg-orange-100',
    borderColor: 'border-orange-300',
    category: 'general',
  },
  {
    id: 'marriage',
    icon: <Heart className="w-4 h-4" />,
    labelEn: 'Marriage',
    labelHi: 'विवाह',
    route: '/question',
    color: 'text-rose-700',
    hoverColor: 'hover:bg-rose-100',
    borderColor: 'border-rose-300',
    category: 'marriage',
  },
  {
    id: 'career',
    icon: <Briefcase className="w-4 h-4" />,
    labelEn: 'Career',
    labelHi: 'करियर',
    route: '/question',
    color: 'text-blue-700',
    hoverColor: 'hover:bg-blue-100',
    borderColor: 'border-blue-300',
    category: 'career',
  },
  {
    id: 'timing',
    icon: <Clock className="w-4 h-4" />,
    labelEn: 'Timing',
    labelHi: 'समय',
    route: '/question',
    color: 'text-violet-700',
    hoverColor: 'hover:bg-violet-100',
    borderColor: 'border-violet-300',
    category: 'timing',
  },
  {
    id: 'lost-item',
    icon: <Search className="w-4 h-4" />,
    labelEn: 'Lost Item',
    labelHi: 'खोई वस्तु',
    route: '/question',
    color: 'text-teal-700',
    hoverColor: 'hover:bg-teal-100',
    borderColor: 'border-teal-300',
    category: 'lost',
  },
  {
    id: 'court-case',
    icon: <Scale className="w-4 h-4" />,
    labelEn: 'Court Case',
    labelHi: 'मुकदमा',
    route: '/question',
    color: 'text-red-700',
    hoverColor: 'hover:bg-red-100',
    borderColor: 'border-red-300',
    category: 'litigation',
  },
  {
    id: 'remedies',
    icon: <Sparkles className="w-4 h-4" />,
    labelEn: 'Remedies',
    labelHi: 'उपाय',
    route: '/remedies',
    color: 'text-emerald-700',
    hoverColor: 'hover:bg-emerald-100',
    borderColor: 'border-emerald-300',
  },
  {
    id: 'research',
    icon: <BookOpen className="w-4 h-4" />,
    labelEn: 'Research Mode',
    labelHi: 'शोध मोड',
    route: '/bv-raman',
    color: 'text-amber-800',
    hoverColor: 'hover:bg-amber-100',
    borderColor: 'border-amber-400',
  },
  {
    id: 'ask-anything',
    icon: <MessageCircle className="w-4 h-4" />,
    labelEn: 'Ask Anything',
    labelHi: 'कुछ भी पूछें',
    route: '/consultation',
    color: 'text-indigo-700',
    hoverColor: 'hover:bg-indigo-100',
    borderColor: 'border-indigo-300',
  },
];

interface PrasnaToolbarProps {
  isHi?: boolean;
  className?: string;
}

const PrasnaToolbar = ({ isHi = false, className = '' }: PrasnaToolbarProps) => {
  const navigate = useNavigate();

  const handleClick = (btn: ToolbarButton) => {
    const url = btn.category ? `${btn.route}?category=${btn.category}` : btn.route;
    navigate(url);
  };

  return (
    <div
      className={`w-full bg-gradient-to-r from-amber-50 via-orange-50 to-rose-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 border-b border-amber-200 dark:border-slate-700 ${className}`}
    >
      <div className="container max-w-6xl mx-auto px-3 py-2">
        <div className="flex flex-wrap gap-1.5 items-center justify-center sm:justify-start">
          {TOOLBAR_BUTTONS.map((btn, i) => (
            <motion.button
              key={btn.id}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => handleClick(btn)}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                text-xs font-semibold border transition-all duration-150
                bg-white dark:bg-slate-700
                ${btn.color} ${btn.hoverColor} ${btn.borderColor}
                dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600
                shadow-sm hover:shadow-md active:scale-95
                ${isHi ? 'font-hindi' : ''}
              `}
              title={isHi ? btn.labelHi : btn.labelEn}
            >
              {btn.icon}
              <span className="hidden sm:inline">{isHi ? btn.labelHi : btn.labelEn}</span>
              <span className="sm:hidden">{isHi ? btn.labelHi.split(' ')[0] : btn.labelEn.split(' ')[0]}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrasnaToolbar;
