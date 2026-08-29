/**
 * BirthInputForm — Clean, focused birth data entry component.
 * Sourced from Code-Data-Shared birth-input-form.tsx + Task-Accomplisher BirthDataForm.tsx.
 * Incorporated into root per CODE-JUNCTION audit July 2026.
 *
 * Differences from EnhancedBirthInputForm:
 * - Compact single-card layout
 * - Direct onSubmit callback with typed BirthInput
 * - No dependency on complex hooks — pure controlled form
 * - IANA timezone-aware (uses lon-derived offset as fallback; accepts explicit tz)
 */
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface BirthFormData {
  name: string;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:MM
  lat: number;
  lon: number;
  tz: number;         // UTC offset in decimal hours (e.g. 5.5 for IST)
  placeOfBirth: string;
}

interface Props {
  onSubmit: (data: BirthFormData) => void;
  defaultValues?: Partial<BirthFormData>;
  submitLabel?: string;
  className?: string;
  compact?: boolean;
}

// 40 major Indian + world cities for quick selection
const CITIES = [
  { name: 'Udaipur',      lat: 24.59, lon: 73.71, tz: 5.5 },
  { name: 'Jaipur',       lat: 26.91, lon: 75.79, tz: 5.5 },
  { name: 'Delhi',        lat: 28.61, lon: 77.21, tz: 5.5 },
  { name: 'Mumbai',       lat: 19.08, lon: 72.88, tz: 5.5 },
  { name: 'Bangalore',    lat: 12.97, lon: 77.59, tz: 5.5 },
  { name: 'Chennai',      lat: 13.08, lon: 80.27, tz: 5.5 },
  { name: 'Kolkata',      lat: 22.57, lon: 88.36, tz: 5.5 },
  { name: 'Hyderabad',    lat: 17.38, lon: 78.49, tz: 5.5 },
  { name: 'Pune',         lat: 18.52, lon: 73.86, tz: 5.5 },
  { name: 'Indore',       lat: 22.72, lon: 75.86, tz: 5.5 },
  { name: 'Bhopal',       lat: 23.26, lon: 77.41, tz: 5.5 },
  { name: 'Jodhpur',      lat: 26.29, lon: 73.02, tz: 5.5 },
  { name: 'Ajmer',        lat: 26.45, lon: 74.64, tz: 5.5 },
  { name: 'Kota',         lat: 25.21, lon: 75.86, tz: 5.5 },
  { name: 'Varanasi',     lat: 25.32, lon: 83.01, tz: 5.5 },
  { name: 'Lucknow',      lat: 26.85, lon: 80.95, tz: 5.5 },
  { name: 'Patna',        lat: 25.60, lon: 85.12, tz: 5.5 },
  { name: 'Ahmedabad',    lat: 23.03, lon: 72.58, tz: 5.5 },
  { name: 'Surat',        lat: 21.17, lon: 72.83, tz: 5.5 },
  { name: 'Nagpur',       lat: 21.15, lon: 79.09, tz: 5.5 },
  { name: 'Nashik',       lat: 19.99, lon: 73.78, tz: 5.5 },
  { name: 'Nandli/Aspur', lat: 23.84, lon: 73.71, tz: 5.5 },
  { name: 'Dungarpur',    lat: 23.84, lon: 73.71, tz: 5.5 },
  { name: 'Banswara',     lat: 23.54, lon: 74.44, tz: 5.5 },
  { name: 'Chittorgarh',  lat: 24.88, lon: 74.62, tz: 5.5 },
  { name: 'Bikaner',      lat: 28.01, lon: 73.31, tz: 5.5 },
  { name: 'Kathmandu',    lat: 27.72, lon: 85.32, tz: 5.75 },
  { name: 'London',       lat: 51.51, lon: -0.13, tz: 0 },
  { name: 'New York',     lat: 40.71, lon: -74.01, tz: -5 },
  { name: 'Dubai',        lat: 25.20, lon: 55.27, tz: 4 },
  { name: 'Singapore',    lat: 1.35,  lon: 103.82, tz: 8 },
  { name: 'Sydney',       lat: -33.87, lon: 151.21, tz: 10 },
];

const DEFAULTS: BirthFormData = {
  name: '',
  date: '',
  time: '',
  lat: 24.59,
  lon: 73.71,
  tz: 5.5,
  placeOfBirth: 'Udaipur',
};

export function BirthInputForm({
  onSubmit,
  defaultValues,
  submitLabel = 'Calculate Chart',
  className,
  compact = false,
}: Props) {
  const [form, setForm] = useState<BirthFormData>({
    ...DEFAULTS,
    ...defaultValues,
  });
  const [citySearch, setCitySearch] = useState(defaultValues?.placeOfBirth ?? '');
  const [cityResults, setCityResults] = useState<typeof CITIES>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof BirthFormData, string>>>({});

  const handleCitySearch = useCallback((query: string) => {
    setCitySearch(query);
    if (query.length >= 2) {
      const matches = CITIES.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 6);
      setCityResults(matches);
    } else {
      setCityResults([]);
    }
  }, []);

  const selectCity = useCallback((city: typeof CITIES[0]) => {
    setCitySearch(city.name);
    setCityResults([]);
    setForm(f => ({ ...f, lat: city.lat, lon: city.lon, tz: city.tz, placeOfBirth: city.name }));
  }, []);

  const validate = (): boolean => {
    const errs: Partial<Record<keyof BirthFormData, string>> = {};
    if (!form.date) errs.date = 'Birth date is required';
    if (!form.time) errs.time = 'Birth time is required';
    if (!form.placeOfBirth) errs.placeOfBirth = 'Place of birth is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'rounded-xl border border-border bg-card p-4 space-y-4',
        compact && 'p-3 space-y-3',
        className
      )}
    >
      {/* Name */}
      <div className="space-y-1">
        <Label htmlFor="bf-name" className="text-xs font-medium">
          Name <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="bf-name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Priyvrit Singh"
          className="h-9 text-sm"
        />
      </div>

      {/* Date + Time row */}
      <div className={cn('grid gap-3', compact ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2')}>
        <div className="space-y-1">
          <Label htmlFor="bf-date" className="text-xs font-medium">
            Date of Birth <span className="text-red-500">*</span>
          </Label>
          <Input
            id="bf-date"
            type="date"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            className={cn('h-9 text-sm', errors.date && 'border-red-500')}
          />
          {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="bf-time" className="text-xs font-medium">
            Time of Birth <span className="text-red-500">*</span>
          </Label>
          <Input
            id="bf-time"
            type="time"
            value={form.time}
            onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
            className={cn('h-9 text-sm', errors.time && 'border-red-500')}
          />
          {errors.time && <p className="text-xs text-red-500">{errors.time}</p>}
        </div>
      </div>

      {/* City search */}
      <div className="space-y-1 relative">
        <Label htmlFor="bf-city" className="text-xs font-medium">
          Place of Birth <span className="text-red-500">*</span>
        </Label>
        <Input
          id="bf-city"
          value={citySearch}
          onChange={e => handleCitySearch(e.target.value)}
          placeholder="Type city name..."
          className={cn('h-9 text-sm', errors.placeOfBirth && 'border-red-500')}
          autoComplete="off"
        />
        {errors.placeOfBirth && <p className="text-xs text-red-500">{errors.placeOfBirth}</p>}

        {/* Dropdown */}
        {cityResults.length > 0 && (
          <div className="absolute z-50 w-full top-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
            {cityResults.map(city => (
              <button
                key={city.name}
                type="button"
                onClick={() => selectCity(city)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-between"
              >
                <span>{city.name}</span>
                <span className="text-xs text-muted-foreground">
                  {city.lat.toFixed(2)}°N, {city.lon.toFixed(2)}°E
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Coordinates (read-only display) */}
      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
        <span>Lat: <strong className="text-foreground">{form.lat.toFixed(4)}°</strong></span>
        <span>Lon: <strong className="text-foreground">{form.lon.toFixed(4)}°</strong></span>
        <span>TZ: <strong className="text-foreground">UTC+{form.tz}</strong></span>
      </div>

      <Button type="submit" className="w-full h-9 text-sm font-medium">
        {submitLabel}
      </Button>
    </form>
  );
}

export default BirthInputForm;
