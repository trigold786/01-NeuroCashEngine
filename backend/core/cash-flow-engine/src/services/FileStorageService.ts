import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileRecord } from '../entities/FileRecord.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface FileResponse {
  fileId: string;
  userId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  createdAt: Date;
}

export interface UploadFileInput {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
  size: number;
}

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);
  private readonly uploadDir: string;

  constructor(
    @InjectRepository(FileRecord)
    private readonly fileRepository: Repository<FileRecord>,
  ) {
    this.uploadDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(file: UploadFileInput, userId: string): Promise<FileResponse> {
    const ext = path.extname(file.originalname);
    const storedName = `${crypto.randomUUID()}${ext}`;
    const storedPath = path.join(this.uploadDir, storedName);

    fs.writeFileSync(storedPath, file.buffer);

    const record = await this.fileRepository.save(
      this.fileRepository.create({
        userId,
        fileName: file.originalname,
        filePath: storedPath,
        mimeType: file.mimetype,
        fileSize: file.size,
      }),
    );

    return this.toResponse(record);
  }

  async getFile(fileId: string): Promise<{ record: FileResponse; filePath: string }> {
    const record = await this.fileRepository.findOne({ where: { fileId } });
    if (!record) throw new NotFoundException('File not found');
    return { record: this.toResponse(record), filePath: record.filePath };
  }

  async deleteFile(fileId: string): Promise<void> {
    const record = await this.fileRepository.findOne({ where: { fileId } });
    if (!record) throw new NotFoundException('File not found');

    try {
      if (fs.existsSync(record.filePath)) {
        fs.unlinkSync(record.filePath);
      }
    } catch (err) {
      this.logger.error(`Failed to delete file from disk: ${record.filePath}`, err);
    }

    await this.fileRepository.delete({ fileId });
  }

  async listFiles(userId: string): Promise<FileResponse[]> {
    const records = await this.fileRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return records.map(r => this.toResponse(r));
  }

  private toResponse(r: FileRecord): FileResponse {
    return {
      fileId: r.fileId,
      userId: r.userId,
      fileName: r.fileName,
      mimeType: r.mimeType,
      fileSize: r.fileSize,
      createdAt: r.createdAt,
    };
  }
}
