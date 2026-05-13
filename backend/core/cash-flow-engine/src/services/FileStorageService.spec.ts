import { Test, TestingModule } from '@nestjs/testing';
import { FileStorageService } from './FileStorageService';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FileRecord } from '../entities/FileRecord.entity';
import * as fs from 'fs';

jest.mock('fs');
jest.mock('crypto', () => ({ randomUUID: () => 'mock-uuid' }));

describe('FileStorageService', () => {
  let service: FileStorageService;

  const mockFileRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
    (fs.unlinkSync as jest.Mock).mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileStorageService,
        { provide: getRepositoryToken(FileRecord), useValue: mockFileRepository },
      ],
    }).compile();

    service = module.get<FileStorageService>(FileStorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upload', () => {
    it('should save file and create record', async () => {
      const file = { originalname: 'test.pdf', buffer: Buffer.from('data'), mimetype: 'application/pdf', size: 100 };
      mockFileRepository.create.mockReturnValue({ userId: 'u1', fileName: 'test.pdf', mimeType: 'application/pdf', fileSize: 100 });
      mockFileRepository.save.mockResolvedValue({ fileId: 'f1', userId: 'u1', fileName: 'test.pdf', mimeType: 'application/pdf', fileSize: 100, createdAt: new Date() });
      const result = await service.upload(file, 'u1');
      expect(result.fileName).toBe('test.pdf');
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });

  describe('getFile', () => {
    it('should return file record and path', async () => {
      mockFileRepository.findOne.mockResolvedValue({ fileId: 'f1', userId: 'u1', fileName: 'test.pdf', filePath: '/path/to/file', mimeType: 'application/pdf', fileSize: 100, createdAt: new Date() });
      const result = await service.getFile('f1');
      expect(result.record.fileId).toBe('f1');
      expect(result.filePath).toBe('/path/to/file');
    });

    it('should throw if not found', async () => {
      mockFileRepository.findOne.mockResolvedValue(null);
      await expect(service.getFile('f1')).rejects.toThrow('File not found');
    });
  });

  describe('deleteFile', () => {
    it('should delete record and file from disk', async () => {
      mockFileRepository.findOne.mockResolvedValue({ fileId: 'f1', filePath: '/path/to/file' });
      mockFileRepository.delete.mockResolvedValue({ affected: 1 });
      await service.deleteFile('f1');
      expect(fs.unlinkSync).toHaveBeenCalledWith('/path/to/file');
    });

    it('should throw if not found', async () => {
      mockFileRepository.findOne.mockResolvedValue(null);
      await expect(service.deleteFile('f1')).rejects.toThrow('File not found');
    });
  });

  describe('listFiles', () => {
    it('should return files for user', async () => {
      mockFileRepository.find.mockResolvedValue([
        { fileId: 'f1', userId: 'u1', fileName: 'a.pdf', mimeType: 'application/pdf', fileSize: 100, createdAt: new Date() },
      ]);
      const result = await service.listFiles('u1');
      expect(result).toHaveLength(1);
    });
  });
});
