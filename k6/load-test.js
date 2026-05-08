import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
  const responses = http.batch([
    ['GET', 'http://localhost:3001/health', null, { tags: { name: 'AccountHealth' } }],
    ['GET', 'http://localhost:3005/health', null, { tags: { name: 'CashFlowHealth' } }],
    ['GET', 'http://localhost:3006/health', null, { tags: { name: 'ContentHubHealth' } }],
    ['GET', 'http://localhost:3007/health', null, { tags: { name: 'DataProductHealth' } }],
  ]);

  responses.forEach(res => {
    check(res, {
      'status was 200': (r) => r.status === 200,
      'transaction time OK': (r) => r.timings.duration < 500,
    });
  });

  sleep(1);
}