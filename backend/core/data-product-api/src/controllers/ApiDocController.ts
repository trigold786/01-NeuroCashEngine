import { Controller, Get } from '@nestjs/common';

interface ApiParam {
  name: string;
  type: string;
  optional?: boolean;
  description?: string;
}

interface ApiEndpoint {
  path: string;
  description: string;
  params?: ApiParam[];
  responseExample?: any;
  errorCodes?: string[];
  rateLimit: string;
}

interface ErrorCodeDefinition {
  code: string;
  description: string;
  httpStatus: number;
}

interface ApiDocumentation {
  service: string;
  version: string;
  baseUrl: string;
  authentication: {
    methods: string[];
    docs: string;
  };
  rateLimiting: {
    defaultLimit: string;
    upgradeAvailable: boolean;
  };
  endpoints: ApiEndpoint[];
  errorCodeDefinitions: ErrorCodeDefinition[];
  sampleCode: {
    curl: string;
    python: string;
    javascript: string;
  };
}

@Controller('data-product')
export class ApiDocController {
  @Get('docs')
  getApiDocs(): ApiDocumentation {
    return {
      service: 'NeuroCashEngine Data Product API',
      version: '1.0.0',
      baseUrl: '/data-product',
      authentication: {
        methods: ['OAuth2.0', 'API Key (X-Api-Key)'],
        docs: 'See /data-product/docs/auth',
      },
      rateLimiting: {
        defaultLimit: '100 requests/minute',
        upgradeAvailable: true,
      },
      endpoints: [
        {
          path: 'GET /sentiment/investment',
          description: 'C-end Investment Sentiment Index',
          params: [{ name: 'date', type: 'string', optional: true }],
          responseExample: { success: true, data: [{ date: '2026-05-13', assetCategory: 'CASH', sentimentScore: 45.5, totalSamples: 100 }] },
          errorCodes: ['ERR_001: Invalid date format', 'ERR_002: No data available'],
          rateLimit: '100/min',
        },
        {
          path: 'GET /data-product/cash-flow-velocity',
          description: 'B-end Cash Flow Velocity',
          params: [{ name: 'industry', type: 'string', optional: true }],
          responseExample: { success: true, data: [{ industryCode: '51', industryName: '批发业', avgTurnoverRate: 72.5 }] },
          errorCodes: ['ERR_001: Invalid industry code'],
          rateLimit: '100/min',
        },
        {
          path: 'GET /data-product/product-preference',
          description: 'Product Preference & Risk Profile',
          params: [{ name: 'region', type: 'string', optional: true }],
          responseExample: { success: true, data: [{ region: 'east', totalUsers: 5000, preferenceDistribution: [] }] },
          errorCodes: ['ERR_003: Invalid region code'],
          rateLimit: '100/min',
        },
        {
          path: 'GET /data-product/regional-consumption',
          description: 'Regional Consumption Vitality Index',
          params: [{ name: 'region', type: 'string', optional: true }],
          responseExample: { success: true, data: [{ region: 'east', vitalityIndex: 78.5 }] },
          errorCodes: ['ERR_003: Invalid region code'],
          rateLimit: '100/min',
        },
        {
          path: 'GET /data-product/nsi-cross-data/overview',
          description: 'NSI-NCE Cross Data Overview',
          responseExample: { success: true, data: { totalUsers: 10000, avgHealthScore: 72.3 } },
          rateLimit: '50/min',
        },
        {
          path: 'POST /data-product/anonymize/k-anonymity',
          description: 'Apply k-anonymity to data',
          params: [{ name: 'k', type: 'number', description: 'Anonymity parameter (minimum 2)' }],
          rateLimit: '20/min',
        },
        {
          path: 'POST /data-product/anonymize/differential-privacy',
          description: 'Add differential privacy noise',
          params: [{ name: 'epsilon', type: 'number', description: 'Privacy budget (lower = more private)' }],
          rateLimit: '20/min',
        },
      ],
      errorCodeDefinitions: [
        { code: 'ERR_001', description: 'Invalid parameter format', httpStatus: 400 },
        { code: 'ERR_002', description: 'No data available for the given parameters', httpStatus: 404 },
        { code: 'ERR_003', description: 'Invalid reference code (industry/region)', httpStatus: 400 },
        { code: 'ERR_004', description: 'Rate limit exceeded', httpStatus: 429 },
        { code: 'ERR_005', description: 'Authentication required', httpStatus: 401 },
        { code: 'ERR_006', description: 'API Key invalid or expired', httpStatus: 403 },
      ],
      sampleCode: {
        curl: `curl -H "X-Api-Key: demo-key-001" https://api.neurocash.com/data-product/cash-flow-velocity?industry=51`,
        python: `import requests\nresponse = requests.get('https://api.neurocash.com/data-product/sentiment/investment', headers={'X-Api-Key': 'demo-key-001'})`,
        javascript: `fetch('https://api.neurocash.com/data-product/sentiment/investment', { headers: { 'X-Api-Key': 'demo-key-001' } })`,
      },
    };
  }
}
