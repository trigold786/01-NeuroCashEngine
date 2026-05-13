import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeyController } from './ApiKeyController';

describe('ApiKeyController', () => {
  let controller: ApiKeyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiKeyController],
    }).compile();

    controller = module.get<ApiKeyController>(ApiKeyController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('listKeys', () => {
    it('should return list of initial keys', () => {
      const result = controller.listKeys();
      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('generateKey', () => {
    it('should generate a new API key', () => {
      const result = controller.generateKey({ name: 'test-key' });
      expect(result.success).toBe(true);
      expect(result.data.key).toBeDefined();
      expect(result.data.name).toBe('test-key');
      expect(result.data.enabled).toBe(true);
    });

    it('should use default name when not provided', () => {
      const result = controller.generateKey({});
      expect(result.data.name).toBe('unnamed-key');
    });

    it('should add new key to the list', () => {
      const generated = controller.generateKey({ name: 'new-key' });
      const list = controller.listKeys();
      expect(list.data.some(k => k.key === generated.data.key)).toBe(true);
    });
  });

  describe('revokeKey', () => {
    it('should revoke an existing key', () => {
      const generated = controller.generateKey({ name: 'to-revoke' });
      const result = controller.revokeKey(generated.data.key);
      expect(result.success).toBe(true);
      expect(result.message).toContain('revoked');
    });

    it('should return not found for non-existent key', () => {
      const result = controller.revokeKey('non-existent-key');
      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });

    it('should remove key from list after revoking', () => {
      const generated = controller.generateKey({ name: 'to-remove' });
      controller.revokeKey(generated.data.key);
      const list = controller.listKeys();
      expect(list.data.some(k => k.key === generated.data.key)).toBe(false);
    });
  });
});
