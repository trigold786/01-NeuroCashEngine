// 简单的对称加密工具，生产环境建议使用更安全的方案
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const KEY = Buffer.from((process.env.ENCRYPTION_KEY || 'nce_encryption_key_256_bit_1234').padEnd(32, '0').slice(0, 32), 'utf-8');
const IV_LENGTH = 16;

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY.slice(0, 32), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(text: string): string {
  const textParts = text.split(':');
  if (textParts.length !== 2) return text;
  
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY.slice(0, 32), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString('utf8');
}

export function encryptBalance(balance: number): string {
  return encrypt(balance.toString());
}

export function decryptBalance(encrypted: string): number {
  try {
    return parseFloat(decrypt(encrypted));
  } catch {
    return 0;
  }
}