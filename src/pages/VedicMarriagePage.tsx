import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import MTSSPanel from '@/components/MTSSPanel';
import { searchCities, type City } from '@/lib/mtss/indianCities';
import { CalendarCheck, Compass, Heart, Sparkles, Users } from 'lucide-react';

type PersonDraft = {
  name: string;
  day: string;
  month: string;
  year: string;
  hour: string;
  minute: string;
  ampm: 'AM' | 'PM';
  city: string;
  lat: string;
  lon: string;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const PRIYVRIT_PRESET: PersonDraft = {
  name: 'Priyvrit Singh',
  day: '8',
  month: '10',
  year: '1999',
  hour: '7',
  minute: '43',
  ampm: 'AM',
  city: 'Udaipur',
  lat: '24.58',
  lon: '73.68',
};

const PRIYRAJ_PRESET: PersonDraft = {
  name: 'Priyraj Singh Ranawat',
  day: '16',
  month: '4',
  year: '2002',
  hour: '7',
  minute: '0',
  ampm: 'AM',
  city: 'Udaipur',
  lat: '24.58',
  lon: '73.68',
};

function CitySearch({
  value,
  onChange,
  onSelect,
}: {
  value: string;
  onChange: (value: string) => void;
  onSelect: (city: City) => void;
}) {
  const [suggestions, setSuggestions] = useState<City[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const matches = searchCities(value);
    setSuggestions(matches);
    setOpen(value.length >= 2 && matches.length > 0);
  }, [value]);

  useEffect(() => {
    const onMouseDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={value}
        onChange={event => onChange(event.target.value)}
        onFocus={() => value.length >= 2 && suggestions.length > 0 && setOpen(true)}
        placeholder="Search Indian city"
        className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-amber-400/50"
      />
      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-white/10 bg-[#0f172a] shadow-2xl">
          {suggestions.map(city => (
            <button
              key={`${city.name}-${city.state}`}
              type="button"
              onClick={() => {
                onSelect(city);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between px-4 py-2 text-left text-sm transition hover:bg-white/5"
            >
              <span className="text-white">{city.name}</span>
              <span className="text-slate-400">{city.state}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function to24Hour(hour: string, ampm: 'AM' | 'PM') {
  let parsedHour = Number(hour || '0');
  if (ampm === 'PM' && parsedHour !== 12) parsedHour += 12;
  if (ampm === 'AM' && parsedHour === 12) parsedHour = 0;
  return parsedHour;
}

export default function VedicMarriagePage() {
  const [person, setPerson] = useState<PersonDraft>(PRIYVRIT_PRESET);
  const [showForm, setShowForm] = useState(false);

  const computedHour = to24Hour(person.hour, person.ampm);

  const panelProps = useMemo(
    () => ({
      name: person.name || 'Unnamed person',
      day: Number(person.day || 8),
      month: Number(person.month || 10),
      year: Number(person.year || 1999),
      hour: computedHour,
      minute: Number(person.minute || 0),
      lat: Number(person.lat || 24.58),
      lon: Number(person.lon || 73.68),
      tz: 5.5,
    }),
    [computedHour, person]
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <SEO
        title="Marriage Timing Suite | Vedic Rajkumar"
        description="Interactive MTSS panel for marriage timing, spouse profile, Navamsa analysis, remedies, and current transit activation."
        keywords="marriage timing, mtss, navamsa, spouse analysis, kundli milan, wedding muhurat"
        canonical="/vedic-marriage"
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(245,158,11,0.12),rgba(15,23,42,0.96)_45%,rgba(14,116,144,0.12))] p-6 shadow-[0_30px_120px_rgba(2,6,23,0.55)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <Badge className="rounded-full border border-amber-300/20 bg-amber-400/10 text-amber-100">
                <Heart className="mr-2 h-4 w-4" />
                Marriage Timing Suite
              </Badge>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                MTSS with live person inputs, Navamsa logic, and transit activation.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                This route now uses the stronger MTSS workflow: dynamic chart inputs, D9 analysis,
                active dasha windows, and live Jupiter-Saturn transit overlay instead of the older
                static marriage page.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => setShowForm(current => !current)}
                className="rounded-full bg-amber-400 text-slate-950 hover:bg-amber-300"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {showForm ? 'Hide person form' : 'Change person'}
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10"
              >
                <Link to="/kundli-compare">
                  <Users className="mr-2 h-4 w-4" />
                  Kundli Milan
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10"
              >
                <Link to="/wedding-muhurat">
                  <CalendarCheck className="mr-2 h-4 w-4" />
                  Wedding Muhurat
                </Link>
              </Button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Active profile</div>
              <div className="mt-2 text-lg font-semibold text-white">{panelProps.name}</div>
              <div className="mt-1 text-sm text-slate-400">
                {person.day}/{person.month}/{person.year} · {person.hour}:{person.minute.padStart(2, '0')} {person.ampm}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Birth place</div>
              <div className="mt-2 text-lg font-semibold text-white">{person.city || 'Manual coordinates'}</div>
              <div className="mt-1 text-sm text-slate-400">
                {panelProps.lat.toFixed(2)}°, {panelProps.lon.toFixed(2)}°
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-slate-500">What changed</div>
              <div className="mt-2 flex items-start gap-2 text-sm text-slate-300">
                <Compass className="mt-0.5 h-4 w-4 text-amber-300" />
                <span>Dynamic MTSS, D9-based spouse reading, cohort QA, and live double-transit visibility.</span>
              </div>
            </div>
          </div>
        </div>

        {showForm && (
          <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-slate-900/70 p-6 shadow-[0_20px_80px_rgba(2,6,23,0.45)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">Live birth input</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Use Priyvrit by default, or switch the details and recompute the full MTSS panel.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPerson(PRIYVRIT_PRESET)}
                  className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10"
                >
                  Load Priyvrit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPerson(PRIYRAJ_PRESET)}
                  className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10"
                >
                  Load Priyraj
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Full name
                </label>
                <input
                  type="text"
                  value={person.name}
                  onChange={event => setPerson(current => ({ ...current, name: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-amber-400/50"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Birth city
                </label>
                <CitySearch
                  value={person.city}
                  onChange={value => setPerson(current => ({ ...current, city: value, lat: '', lon: '' }))}
                  onSelect={city =>
                    setPerson(current => ({
                      ...current,
                      city: city.name,
                      lat: String(city.lat),
                      lon: String(city.lon),
                    }))
                  }
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Coordinates
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={person.lat}
                    onChange={event => setPerson(current => ({ ...current, lat: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-amber-400/50"
                    placeholder="Lat"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={person.lon}
                    onChange={event => setPerson(current => ({ ...current, lon: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-amber-400/50"
                    placeholder="Lon"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Birth date
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={person.day}
                    onChange={event => setPerson(current => ({ ...current, day: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-amber-400/50"
                    placeholder="Day"
                  />
                  <select
                    value={person.month}
                    onChange={event => setPerson(current => ({ ...current, month: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-amber-400/50"
                  >
                    {MONTHS.map((monthName, index) => (
                      <option key={monthName} value={index + 1} className="bg-slate-900">
                        {monthName}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1900"
                    max="2030"
                    value={person.year}
                    onChange={event => setPerson(current => ({ ...current, year: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-amber-400/50"
                    placeholder="Year"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Birth time
                </label>
                <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={person.hour}
                    onChange={event => setPerson(current => ({ ...current, hour: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-amber-400/50"
                    placeholder="Hour"
                  />
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={person.minute}
                    onChange={event => setPerson(current => ({ ...current, minute: event.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-amber-400/50"
                    placeholder="Minute"
                  />
                  <select
                    value={person.ampm}
                    onChange={event =>
                      setPerson(current => ({ ...current, ampm: event.target.value as 'AM' | 'PM' }))
                    }
                    className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-amber-400/50"
                  >
                    <option value="AM" className="bg-slate-900">
                      AM
                    </option>
                    <option value="PM" className="bg-slate-900">
                      PM
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8">
          <MTSSPanel {...panelProps} />
        </div>
      </div>
    </div>
  );
}
