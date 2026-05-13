import { Test, TestingModule } from '@nestjs/testing';
import { RateLimitConfigController } from './RateLimitConfigController';

describe('RateLimitConfigController', () => {
  let controller: RateLimitConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RateLimitConfigController],
    }).compile();

    controller = module.get<RateLimitConfigController>(RateLimitConfigController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getConfig', () => {
    it('should return default rate limit config', () => {
      const result = controller.getConfig();
      expect(result.success).toBe(true);
      expect(result.data.maxRequests).toBe(100);
      expect(result.data.windowMs).toBe(60000);
    });
  });

  describe('updateConfig', () => {
    it('should update maxRequests', () => {
      const result = controller.updateConfig({ maxRequests: 200 });
      expect(result.data.maxRequests).toBe(200);
      expect(result.data.windowMs).toBe(60000);
    });

    it('should update windowMs', () => {
      const result = controller.updateConfig({ windowMs: 30000 });
      expect(result.data.maxRequests).toBe(100);
      expect(result.data.windowMs).toBe(30000);
    });

    it('should update both fields', () => {
      const result = controller.updateConfig({ maxRequests: 50, windowMs: 120000 });
      expect(result.data.maxRequests).toBe(50);
      expect(result.data.windowMs).toBe(120000);
    });

    it('should persist updates across calls', () => {
      controller.updateConfig({ maxRequests: 75 });
      const result = controller.getConfig();
      expect(result.data.maxRequests).toBe(75);
    });
  });
});
