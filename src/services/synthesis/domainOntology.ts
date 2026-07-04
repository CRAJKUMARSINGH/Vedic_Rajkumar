import { SynthesisDomain } from './signalTypes';

export interface DomainConfig {
  primaryHouses: number[];
  secondaryHouses: number[];
  keyDivisionals: ('D1' | 'D9' | 'D10' | 'D7' | 'D2' | 'D60')[];
  karakas: string[];
}

export const DOMAIN_ONTOLOGY: Record<SynthesisDomain, DomainConfig> = {
  career: {
    primaryHouses: [10, 6, 2, 11, 1],
    secondaryHouses: [5, 9, 7],
    keyDivisionals: ['D1', 'D10', 'D9', 'D60'],
    karakas: ['Saturn', 'Sun', 'Mercury', 'Jupiter'],
  },
  marriage: {
    primaryHouses: [7, 2, 11],
    secondaryHouses: [1, 5, 8, 12],
    keyDivisionals: ['D1', 'D9'],
    karakas: ['Venus', 'Jupiter'],
  },
  wealth: {
    primaryHouses: [2, 11, 9, 5],
    secondaryHouses: [1, 10, 8],
    keyDivisionals: ['D1', 'D9', 'D2'],
    karakas: ['Jupiter', 'Venus'],
  },
  children: {
    primaryHouses: [5, 2, 9],
    secondaryHouses: [1, 7, 11],
    keyDivisionals: ['D1', 'D7', 'D9'],
    karakas: ['Jupiter'],
  },
  fame: {
    primaryHouses: [10, 11, 1],
    secondaryHouses: [5, 9],
    keyDivisionals: ['D1', 'D10', 'D60'],
    karakas: ['Sun', 'Rahu', 'Jupiter'],
  },
};
