import { Test, TestingModule } from '@nestjs/testing';
import { ConfigController } from './ConfigController';
import { ConfigService } from '../services/ConfigService';
import { ForbiddenException } from '@nestjs/common';

describe('ConfigController', () => {
  let controller: ConfigController;

  const mockConfigService = {
    getAll: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfigController],
      providers: [
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<ConfigController>(ConfigController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /config', () => {
    it('should return all configs', async () => {
      mockConfigService.getAll.mockResolvedValue([{ configKey: 'k1', configValue: 'v1' }]);
      const result = await controller.getAll({ user: { id: 'u1' } });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });

  describe('GET /config/:key', () => {
    it('should return config by key', async () => {
      mockConfigService.get.mockResolvedValue('v1');
      const result = await controller.getByKey('k1');
      expect(result.success).toBe(true);
      expect(result.data.configValue).toBe('v1');
    });
  });

  describe('PUT /config/:key', () => {
    it('should update config if admin', async () => {
      mockConfigService.set.mockResolvedValue({ configKey: 'k1', configValue: 'new' });
      const result = await controller.setByKey('k1', { value: 'new' }, { user: { role: 'admin' } });
      expect(result.success).toBe(true);
    });

    it('should throw ForbiddenException if not admin', async () => {
      await expect(
        controller.setByKey('k1', { value: 'new' }, { user: { role: 'user' } })
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
