import { Test, TestingModule } from '@nestjs/testing';
import { FileStorageController } from './FileStorageController';
import { FileStorageService } from '../services/FileStorageService';

describe('FileStorageController', () => {
  let controller: FileStorageController;

  const mockFileStorageService = {
    upload: jest.fn(),
    getFile: jest.fn(),
    deleteFile: jest.fn(),
    listFiles: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileStorageController],
      providers: [
        { provide: FileStorageService, useValue: mockFileStorageService },
      ],
    }).compile();

    controller = module.get<FileStorageController>(FileStorageController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /files/upload', () => {
    it('should upload file', async () => {
      mockFileStorageService.upload.mockResolvedValue({ fileId: 'f1', fileName: 'test.pdf' });
      const result = await controller.upload({ originalname: 'test.pdf', buffer: Buffer.from(''), mimetype: 'application/pdf', size: 100 } as any, { user: { id: 'u1' } });
      expect(result.success).toBe(true);
    });

    it('should return error if no file', async () => {
      const result = await controller.upload(undefined as any, { user: { id: 'u1' } });
      expect(result.success).toBe(false);
    });
  });

  describe('DELETE /files/:id', () => {
    it('should delete file', async () => {
      mockFileStorageService.deleteFile.mockResolvedValue(undefined);
      const result = await controller.deleteFile('f1');
      expect(result.success).toBe(true);
    });
  });

  describe('GET /files', () => {
    it('should list files', async () => {
      mockFileStorageService.listFiles.mockResolvedValue([{ fileId: 'f1', fileName: 'test.pdf' }]);
      const result = await controller.listFiles({ user: { id: 'u1' } });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });
  });
});
