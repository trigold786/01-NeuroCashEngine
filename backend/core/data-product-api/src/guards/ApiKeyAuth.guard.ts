import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const validKeys = (process.env.DATA_API_KEYS || 'demo-key-001,demo-key-002').split(',');
    if (validKeys.includes(apiKey)) {
      request.apiKey = apiKey;
      return true;
    }
    return false;
  }
}
