import { Injectable, CanActivate, ExecutionContext, HttpException, Inject, Optional } from '@nestjs/common';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(@Optional() @Inject('RATE_LIMIT_CONFIG') private config: { maxRequests: number; windowMs: number }) {
    this.config = config || { maxRequests: 100, windowMs: 60000 };
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const key = request.ip || request.headers['x-forwarded-for'] || 'anonymous';
    const now = Date.now();

    const record = this.requests.get(key);
    if (!record || now > record.resetTime) {
      this.requests.set(key, { count: 1, resetTime: now + this.config.windowMs });
      return true;
    }

    record.count++;
    if (record.count > this.config.maxRequests) {
      throw new HttpException('Rate limit exceeded', 429);
    }
    return true;
  }
}
