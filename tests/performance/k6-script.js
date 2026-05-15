import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const baseUrl = __ENV.BASE_URL || 'https://localhost';
const failureRate = new Rate('failed_requests');
const loginTrend = new Trend('login_duration');
const assetsTrend = new Trend('assets_duration');

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '30s', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    failed_requests: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
  },
  insecureSkipTLSVerify: true,
};

export default function () {
  group('Login', () => {
    const payload = JSON.stringify({
      email: 'uat3@example.com',
      password: 'UAT123456',
    });
    const res = http.post(`${baseUrl}/api/auth/login`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    loginTrend.add(res.timings.duration);
    failureRate.add(res.status !== 201);
    check(res, {
      'login status 201': (r) => r.status === 201,
      'login has token': (r) => r.json('access_token') !== undefined,
    });
    if (res.status === 201) {
      const token = res.json('access_token');
      sleep(1);

      group('Asset Overview', () => {
        const res2 = http.get(`${baseUrl}/assets/overview`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        assetsTrend.add(res2.timings.duration);
        failureRate.add(res2.status !== 200);
        check(res2, {
          'assets status 200': (r) => r.status === 200,
        });
      });
      sleep(1);

      group('News List', () => {
        const res3 = http.get(`${baseUrl}/news`);
        failureRate.add(res3.status !== 200);
        check(res3, { 'news status 200': (r) => r.status === 200 });
      });
      sleep(1);

      group('Cash Flow Forecast', () => {
        const res4 = http.get(`${baseUrl}/cashflow/forecast?days=90`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        failureRate.add(res4.status !== 200);
        check(res4, { 'forecast status 200': (r) => r.status === 200 });
      });
    }
  });
}
