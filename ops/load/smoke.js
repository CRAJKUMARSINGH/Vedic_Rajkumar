import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 20 },
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<800', 'p(99)<1500'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE = __ENV.BASE_URL || 'https://api.vedic-rajkumar.app';
const KEY = __ENV.API_KEY || 'vk_test_sample';

export default function () {
  const res = http.post(`${BASE}/v1/charts`, JSON.stringify({
    date: '1990-01-01', time: '12:00', latitude: 28.6, longitude: 77.2, timezone: 'Asia/Kolkata',
  }), { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` } });

  check(res, {
    'status 2xx': (r) => r.status >= 200 && r.status < 300,
    'has lagna': (r) => r.body.includes('lagna'),
  });
  sleep(0.5);
}
