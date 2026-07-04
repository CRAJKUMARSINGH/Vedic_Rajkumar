export interface City {
  name: string;
  state: string;
  lat: number;
  lon: number;
}

export const INDIAN_CITIES: City[] = [
  // Rajasthan
  { name:"Udaipur",       state:"Rajasthan",     lat:24.58,  lon:73.68 },
  { name:"Jaipur",        state:"Rajasthan",     lat:26.91,  lon:75.79 },
  { name:"Jodhpur",       state:"Rajasthan",     lat:26.29,  lon:73.02 },
  { name:"Kota",          state:"Rajasthan",     lat:25.21,  lon:75.86 },
  { name:"Ajmer",         state:"Rajasthan",     lat:26.45,  lon:74.64 },
  { name:"Bikaner",       state:"Rajasthan",     lat:28.01,  lon:73.31 },
  { name:"Chittorgarh",   state:"Rajasthan",     lat:24.88,  lon:74.62 },
  { name:"Dungarpur",     state:"Rajasthan",     lat:23.84,  lon:73.71 },
  { name:"Bharatpur",     state:"Rajasthan",     lat:27.22,  lon:77.49 },
  // MP
  { name:"Indore",        state:"Madhya Pradesh",lat:22.72,  lon:75.86 },
  { name:"Bhopal",        state:"Madhya Pradesh",lat:23.26,  lon:77.41 },
  { name:"Gwalior",       state:"Madhya Pradesh",lat:26.22,  lon:78.18 },
  { name:"Ujjain",        state:"Madhya Pradesh",lat:23.18,  lon:75.78 },
  { name:"Jabalpur",      state:"Madhya Pradesh",lat:23.16,  lon:79.95 },
  // Maharashtra
  { name:"Mumbai",        state:"Maharashtra",   lat:19.08,  lon:72.88 },
  { name:"Pune",          state:"Maharashtra",   lat:18.52,  lon:73.86 },
  { name:"Nagpur",        state:"Maharashtra",   lat:21.15,  lon:79.09 },
  // Gujarat
  { name:"Ahmedabad",     state:"Gujarat",       lat:23.03,  lon:72.59 },
  { name:"Surat",         state:"Gujarat",       lat:21.17,  lon:72.83 },
  { name:"Vadodara",      state:"Gujarat",       lat:22.31,  lon:73.19 },
  // Delhi / NCR
  { name:"New Delhi",     state:"Delhi",         lat:28.61,  lon:77.21 },
  { name:"Noida",         state:"UP",            lat:28.54,  lon:77.39 },
  { name:"Gurgaon",       state:"Haryana",       lat:28.46,  lon:77.03 },
  // UP
  { name:"Lucknow",       state:"Uttar Pradesh", lat:26.85,  lon:80.95 },
  { name:"Kanpur",        state:"Uttar Pradesh", lat:26.46,  lon:80.33 },
  { name:"Varanasi",      state:"Uttar Pradesh", lat:25.32,  lon:83.00 },
  { name:"Agra",          state:"Uttar Pradesh", lat:27.18,  lon:78.01 },
  { name:"Allahabad",     state:"Uttar Pradesh", lat:25.45,  lon:81.84 },
  // Punjab / Haryana
  { name:"Amritsar",      state:"Punjab",        lat:31.63,  lon:74.87 },
  { name:"Chandigarh",    state:"Punjab",        lat:30.74,  lon:76.79 },
  { name:"Ludhiana",      state:"Punjab",        lat:30.91,  lon:75.85 },
  // Karnataka
  { name:"Bangalore",     state:"Karnataka",     lat:12.97,  lon:77.59 },
  { name:"Mysore",        state:"Karnataka",     lat:12.30,  lon:76.65 },
  // Tamil Nadu
  { name:"Chennai",       state:"Tamil Nadu",    lat:13.08,  lon:80.27 },
  { name:"Coimbatore",    state:"Tamil Nadu",    lat:11.01,  lon:76.97 },
  // Andhra / Telangana
  { name:"Hyderabad",     state:"Telangana",     lat:17.38,  lon:78.49 },
  { name:"Visakhapatnam", state:"Andhra Pradesh",lat:17.69,  lon:83.22 },
  // West Bengal
  { name:"Kolkata",       state:"West Bengal",   lat:22.57,  lon:88.36 },
  // Bihar / Jharkhand
  { name:"Patna",         state:"Bihar",         lat:25.60,  lon:85.13 },
  { name:"Ranchi",        state:"Jharkhand",     lat:23.35,  lon:85.33 },
  // Odisha
  { name:"Bhubaneswar",   state:"Odisha",        lat:20.30,  lon:85.82 },
];

export function searchCities(query: string): City[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return INDIAN_CITIES.filter(c =>
    c.name.toLowerCase().startsWith(q) ||
    c.name.toLowerCase().includes(q)
  ).slice(0, 8);
}
