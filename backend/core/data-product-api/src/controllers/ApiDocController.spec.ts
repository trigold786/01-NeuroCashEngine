import { Test, TestingModule } from '@nestjs/testing';
import { ApiDocController } from './ApiDocController';

describe('ApiDocController', () => {
  let controller: ApiDocController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiDocController],
    }).compile();

    controller = module.get<ApiDocController>(ApiDocController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getApiDocs', () => {
    it('should return service info', () => {
      const result = controller.getApiDocs();
      expect(result.service).toBe('NeuroCashEngine Data Product API');
      expect(result.version).toBe('1.0.0');
      expect(result.baseUrl).toBe('/data-product');
    });

    it('should list authentication methods', () => {
      const result = controller.getApiDocs();
      expect(result.authentication.methods).toContain('OAuth2.0');
      expect(result.authentication.methods).toContain('API Key (X-Api-Key)');
    });

    it('should include all expected endpoints', () => {
      const result = controller.getApiDocs();
      const paths = result.endpoints.map(e => e.path);
      expect(paths).toContain('GET /sentiment/investment');
      expect(paths).toContain('GET /data-product/cash-flow-velocity');
      expect(paths).toContain('GET /data-product/product-preference');
      expect(paths).toContain('GET /data-product/regional-consumption');
      expect(paths).toContain('GET /data-product/nsi-cross-data/overview');
      expect(paths).toContain('POST /data-product/anonymize/k-anonymity');
      expect(paths).toContain('POST /data-product/anonymize/differential-privacy');
    });

    it('should include error code definitions', () => {
      const result = controller.getApiDocs();
      const codes = result.errorCodeDefinitions.map(e => e.code);
      expect(codes).toContain('ERR_001');
      expect(codes).toContain('ERR_002');
      expect(codes).toContain('ERR_003');
      expect(codes).toContain('ERR_004');
      expect(codes).toContain('ERR_005');
      expect(codes).toContain('ERR_006');
    });

    it('should include sample code in all languages', () => {
      const result = controller.getApiDocs();
      expect(result.sampleCode.curl).toContain('curl');
      expect(result.sampleCode.python).toContain('requests');
      expect(result.sampleCode.javascript).toContain('fetch');
    });

    it('should include rate limiting info', () => {
      const result = controller.getApiDocs();
      expect(result.rateLimiting.defaultLimit).toBe('100 requests/minute');
      expect(result.rateLimiting.upgradeAvailable).toBe(true);
    });
  });
});
