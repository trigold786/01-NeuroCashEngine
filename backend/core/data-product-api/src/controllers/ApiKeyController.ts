import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import * as crypto from 'crypto';

interface ApiKeyEntry {
  key: string;
  name: string;
  createdAt: string;
  enabled: boolean;
}

@Controller('data-product/auth/api-key')
export class ApiKeyController {
  private apiKeys: Map<string, ApiKeyEntry> = new Map();

  constructor() {
    const defaultKeys = (process.env.DATA_API_KEYS || 'demo-key-001,demo-key-002').split(',');
    for (const key of defaultKeys) {
      this.apiKeys.set(key, {
        key,
        name: `default-${key}`,
        createdAt: new Date().toISOString(),
        enabled: true,
      });
    }
  }

  @Post('generate')
  generateKey(@Body() body: { name?: string }): { success: boolean; data: ApiKeyEntry } {
    const key = crypto.randomUUID();
    const entry: ApiKeyEntry = {
      key,
      name: body.name || 'unnamed-key',
      createdAt: new Date().toISOString(),
      enabled: true,
    };
    this.apiKeys.set(key, entry);
    return { success: true, data: entry };
  }

  @Get('list')
  listKeys(): { success: boolean; data: ApiKeyEntry[] } {
    return { success: true, data: Array.from(this.apiKeys.values()) };
  }

  @Delete(':key')
  revokeKey(@Param('key') key: string): { success: boolean; message: string } {
    const existed = this.apiKeys.has(key);
    this.apiKeys.delete(key);
    return {
      success: existed,
      message: existed ? `API key ${key} revoked` : `API key ${key} not found`,
    };
  }
}
