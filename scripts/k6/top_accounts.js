import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const TOKEN = __ENV.ACCESS_TOKEN || '';

const latency = new Trend('top_accounts_latency');

export const options = {
  scenarios: {
    reports: {
      executor: 'constant-arrival-rate',
      rate: 20,
      timeUnit: '1s',
      duration: '1m',
      preAllocatedVUs: 50,
      maxVUs: 100,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<300'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/reports/top-accounts?limit=3`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });
  latency.add(res.timings.duration);
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1);
}
