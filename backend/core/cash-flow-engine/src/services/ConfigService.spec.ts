import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from './ConfigService';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SystemConfig } from '../entities/SystemConfig.entity';

describe('ConfigService', () => {
  let service: ConfigService;

  const mockConfigRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        { provide: getRepositoryToken(SystemConfig), useValue: mockConfigRepository },
      ],
    }).compile();

    service = module.get<ConfigService>(ConfigService);
    mockConfigRepository.findOne.mockResolvedValue(null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get', () => {
    it('should return config value', async () => {
      mockConfigRepository.findOne.mockResolvedValue({ configKey: 'key1', configValue: 'val1' });
      const result = await service.get('key1');
      expect(result).toBe('val1');
    });

    it('should return null if not found', async () => {
      mockConfigRepository.findOne.mockResolvedValue(null);
      const result = await service.get('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('should update existing config', async () => {
      const existing = { configKey: 'key1', configValue: 'old', description: 'desc', updatedAt: new Date() };
      mockConfigRepository.findOne.mockResolvedValue(existing);
      mockConfigRepository.save.mockResolvedValue({ ...existing, configValue: 'new' });
      const result = await service.set('key1', 'new');
      expect(result.configValue).toBe('new');
    });

    it('should create new config if not exists', async () => {
      mockConfigRepository.findOne.mockResolvedValue(null);
      mockConfigRepository.create.mockReturnValue({ configKey: 'key1', configValue: 'val1' });
      mockConfigRepository.save.mockResolvedValue({ configKey: 'key1', configValue: 'val1', description: null, updatedAt: new Date() });
      const result = await service.set('key1', 'val1');
      expect(result.configValue).toBe('val1');
    });
  });

  describe('getAll', () => {
    it('should return all configs', async () => {
      mockConfigRepository.find.mockResolvedValue([
        { configKey: 'a', configValue: '1', description: null, updatedAt: new Date() },
        { configKey: 'b', configValue: '2', description: null, updatedAt: new Date() },
      ]);
      const result = await service.getAll();
      expect(result).toHaveLength(2);
    });
  });

  describe('getByPrefix', () => {
    it('should return configs matching prefix', async () => {
      mockConfigRepository.find.mockResolvedValue([
        { configKey: 'dataRefreshInterval', configValue: '3600', description: null, updatedAt: new Date() },
      ]);
      const result = await service.getByPrefix('data');
      expect(result).toHaveLength(1);
    });
  });
});
