import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 20 },
    { duration: '30s', target: 400 },
    { duration: '1m', target: 400 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1500'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE = __ENV.BASE_URL || 'https://api.vedic-rajkumar.app';
const KEY = __ENV.API_KEY || 'vk_test_sample';

export default function () {
  const res = http.get(`${BASE}/health`, {
    headers: { Authorization: `Bearer ${KEY}` },
  });
  check(res, { 'health 2xx': (r) => r.status >= 200 && r.status < 500 });
  sleep(0.2);
}
