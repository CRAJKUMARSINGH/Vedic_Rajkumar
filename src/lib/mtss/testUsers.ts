import type { JatakInput } from "./mtssEngine";

/** Priyvrit Singh — the primary subject */
export const PRIYVRIT_SINGH: JatakInput = {
  id:"priyvrit_1999",
  name:"Priyvrit Singh (Groom)",
  day:8,month:10,year:1999,
  hour:7,minute:43,
  placeOfBirth:"Udaipur, Rajasthan",
  lat:24.58,lon:73.68,tz:5.5,
  notes:"Primary subject. Uttara Phalguni Nakshatra. Rahu Mahadasha active."
};

/** 11 similar male jataks for batch testing */
export const TEST_USERS: JatakInput[] = [
  {
    id:"jatak_priyansh",
    name:"Priyansh Singh Chauhan",
    day:26,month:10,year:2000,
    hour:0,minute:50,
    placeOfBirth:"Indore, MP",
    lat:22.72,lon:75.86,tz:5.5,
    notes:"Son. Mars Mahadasha likely."
  },
  {
    id:"jatak_vishwaraj",
    name:"Vishwaraj Singh Chauhan",
    day:26,month:9,year:1994,
    hour:2,minute:17,
    placeOfBirth:"Indore, MP",
    lat:22.72,lon:75.86,tz:5.5,
    notes:"Son. Older. Saturn MD possible."
  },
  {
    id:"jatak_pankaj",
    name:"Pankaj Jain",
    day:28,month:7,year:1979,
    hour:23,minute:50,
    placeOfBirth:"Dungarpur, Rajasthan",
    lat:23.84,lon:73.71,tz:5.5,
    notes:"Friend/Relative."
  },
  {
    id:"jatak_rajkumar",
    name:"Rajkumar",
    day:15,month:9,year:1963,
    hour:6,minute:0,
    placeOfBirth:"Nandli (Aspur), Rajasthan",
    lat:23.84,lon:73.71,tz:5.5,
    notes:"Self. Moon in Cancer. Married."
  },
  {
    id:"test_1999_similar_1",
    name:"Aniket Sharma (1999)",
    day:14,month:2,year:1999,
    hour:8,minute:15,
    placeOfBirth:"Jaipur, Rajasthan",
    lat:26.91,lon:75.79,tz:5.5,
    notes:"Similar age group — Rahu MD test."
  },
  {
    id:"test_1998_similar_2",
    name:"Rohan Meena (1998)",
    day:20,month:5,year:1998,
    hour:6,minute:30,
    placeOfBirth:"Kota, Rajasthan",
    lat:25.21,lon:75.86,tz:5.5,
    notes:"Leo Moon, Venus MD — strong marriage window."
  },
  {
    id:"test_2000_similar_3",
    name:"Shivam Chauhan (2000)",
    day:5,month:4,year:2000,
    hour:11,minute:0,
    placeOfBirth:"Udaipur, Rajasthan",
    lat:24.58,lon:73.68,tz:5.5,
    notes:"Born in Udaipur same as Priyvrit — comparison test."
  },
  {
    id:"test_1997_similar_4",
    name:"Abhinav Tiwari (1997)",
    day:12,month:11,year:1997,
    hour:5,minute:45,
    placeOfBirth:"Bhopal, MP",
    lat:23.26,lon:77.41,tz:5.5,
    notes:"Jupiter MD — auspicious for marriage."
  },
  {
    id:"test_2001_similar_5",
    name:"Kartik Agarwal (2001)",
    day:3,month:8,year:2001,
    hour:9,minute:20,
    placeOfBirth:"Ajmer, Rajasthan",
    lat:26.45,lon:74.64,tz:5.5,
    notes:"Younger cohort — Mars MD period."
  },
  {
    id:"test_1999_similar_6",
    name:"Devraj Solanki (1999)",
    day:30,month:6,year:1999,
    hour:14,minute:0,
    placeOfBirth:"Jodhpur, Rajasthan",
    lat:26.29,lon:73.02,tz:5.5,
    notes:"Same birth year as Priyvrit — different MD."
  },
  {
    id:"test_1996_similar_7",
    name:"Mukesh Rajput (1996)",
    day:18,month:3,year:1996,
    hour:7,minute:0,
    placeOfBirth:"Chittorgarh, Rajasthan",
    lat:24.88,lon:74.62,tz:5.5,
    notes:"Venus MD — highest marriage potential in batch."
  },
];

export const ALL_TEST_SUBJECTS = [PRIYVRIT_SINGH, ...TEST_USERS];
