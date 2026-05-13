import { Controller, Get, Post, Delete, Param, Req, UseGuards, Logger, InternalServerErrorException, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileStorageService, UploadFileInput } from '../services/FileStorageService';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Response } from 'express';
import * as fs from 'fs';

@Controller('files')
export class FileStorageController {
  private readonly logger = new Logger(FileStorageController.name);

  constructor(private readonly fileStorageService: FileStorageService) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: UploadFileInput, @Req() req: any) {
    try {
      if (!file) {
        return { success: false, message: 'No file uploaded' };
      }
      const data = await this.fileStorageService.upload(file, req.user.id);
      return { success: true, data };
    } catch (err) {
      this.logger.error('Failed to upload file', err);
      throw new InternalServerErrorException('Failed to upload file');
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getFile(@Param('id') id: string, @Res() res: Response) {
    try {
      const { record, filePath } = await this.fileStorageService.getFile(id);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'File not found on disk' });
      }
      const stream = fs.createReadStream(filePath);
      res.set({
        'Content-Type': record.mimeType,
        'Content-Disposition': `attachment; filename="${record.fileName}"`,
      });
      stream.pipe(res);
    } catch (err) {
      this.logger.error('Failed to get file', err);
      if ((err as any).status === 404) throw err;
      throw new InternalServerErrorException('Failed to retrieve file');
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteFile(@Param('id') id: string) {
    try {
      await this.fileStorageService.deleteFile(id);
      return { success: true };
    } catch (err) {
      this.logger.error('Failed to delete file', err);
      throw err;
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async listFiles(@Req() req: any) {
    try {
      const data = await this.fileStorageService.listFiles(req.user.id);
      return { success: true, data };
    } catch (err) {
      this.logger.error('Failed to list files', err);
      throw new InternalServerErrorException('Failed to list files');
    }
  }
}
