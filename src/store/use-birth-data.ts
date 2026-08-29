import { create } from 'zustand';

interface BirthDataState {
  date: string;
  time: string;
  city: string;
  lat: number;
  lon: number;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
  setCity: (city: string) => void;
  setCoords: (lat: number, lon: number) => void;
  setAll: (data: Partial<BirthDataState>) => void;
}

export const useBirthData = create<BirthDataState>((set) => ({
  date: '',
  time: '',
  city: '',
  lat: 0,
  lon: 0,
  setDate: (date) => set({ date }),
  setTime: (time) => set({ time }),
  setCity: (city) => set({ city }),
  setCoords: (lat, lon) => set({ lat, lon }),
  setAll: (data) => set(data),
}));
