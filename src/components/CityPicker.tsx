import { useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  searchWorldCities,
  findCityByLabel,
  type WorldCity,
} from '@/data/worldCities';

export interface CityPickerValue {
  label: string;
  lat: number;
  lon: number;
  utcOffsetHours: number;
  dst: boolean;
}

interface Props {
  label: string;
  value: CityPickerValue;
  onChange: (value: CityPickerValue) => void;
  showDst?: boolean;
  showCoords?: boolean;
  lang?: 'en' | 'hi';
}

export default function CityPicker({
  label,
  value,
  onChange,
  showDst = true,
  showCoords = false,
  lang = 'en',
}: Props) {
  const isHi = lang === 'hi';
  const [query, setQuery] = useState(value.label);
  const [open, setOpen] = useState(false);

  const suggestions = useMemo(() => searchWorldCities(query), [query]);

  const pickCity = (city: WorldCity) => {
    onChange({
      label: city.label,
      lat: city.lat,
      lon: city.lon,
      utcOffsetHours: city.utcOffsetHours,
      dst: value.dst,
    });
    setQuery(city.label);
    setOpen(false);
  };

  const handleManualCoords = (lat: number, lon: number) => {
    onChange({ ...value, lat, lon, label: query || value.label });
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1">
        <MapPin className="w-3 h-3" />
        {label}
      </Label>
      <div className="relative">
        <Input
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setOpen(true);
            const match = findCityByLabel(e.target.value);
            if (match) pickCity(match);
            else onChange({ ...value, label: e.target.value });
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={isHi ? 'शहर खोजें…' : 'Search city…'}
        />
        {open && suggestions.length > 0 && (
          <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover shadow-md max-h-48 overflow-auto">
            {suggestions.map(c => (
              <button
                key={c.label}
                type="button"
                className="w-full text-left px-3 py-2 text-xs hover:bg-accent"
                onMouseDown={() => pickCity(c)}
              >
                {c.label}
                <span className="text-muted-foreground ml-2">UTC{c.utcOffsetHours >= 0 ? '+' : ''}{c.utcOffsetHours}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {showDst && (
        <div className="flex items-center justify-between rounded-md border px-3 py-2">
          <span className="text-xs text-muted-foreground">
            {isHi ? 'डेलाइट सेविंग (DST +1h)' : 'Daylight Saving (DST +1h)'}
          </span>
          <Switch
            checked={value.dst}
            onCheckedChange={dst => onChange({ ...value, dst })}
          />
        </div>
      )}

      {showCoords && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[10px]">{isHi ? 'अक्षांश' : 'Latitude'}</Label>
            <Input
              type="number"
              step="0.01"
              value={value.lat}
              onChange={e => handleManualCoords(Number(e.target.value), value.lon)}
            />
          </div>
          <div>
            <Label className="text-[10px]">{isHi ? 'देशांतर' : 'Longitude'}</Label>
            <Input
              type="number"
              step="0.01"
              value={value.lon}
              onChange={e => handleManualCoords(value.lat, Number(e.target.value))}
            />
          </div>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground">
        {value.lat.toFixed(2)}°, {value.lon.toFixed(2)}° · UTC{value.utcOffsetHours >= 0 ? '+' : ''}{value.utcOffsetHours}
        {value.dst ? ' (+DST)' : ''}
      </p>
    </div>
  );
}
