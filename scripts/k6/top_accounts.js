import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const API_KEY = __ENV.API_KEY || "";

export const options = {
  scenarios: {
    top_accounts: {
      executor: "constant-arrival-rate",
      rate: 20,
      timeUnit: "1s",
      duration: "1m",
      preAllocatedVUs: 20,
      maxVUs: 100,
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<300"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/reports/top-accounts?limit=3`, {
    headers: {
      "x-api-key": API_KEY,
    },
  });

  check(res, {
    "status is 200": (r) => r.status === 200,
    "response has array": (r) => Array.isArray(r.json()),
  });

  sleep(0.1);
}
