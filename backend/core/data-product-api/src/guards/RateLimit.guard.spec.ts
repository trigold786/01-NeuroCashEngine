import { RateLimitGuard } from './RateLimit.guard';

describe('RateLimitGuard', () => {
  let guard: RateLimitGuard;

  beforeEach(() => {
    guard = new RateLimitGuard({ maxRequests: 3, windowMs: 60000 });
  });

  const mockContext = (ip: string) => {
    const request = { ip, headers: {} };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as any;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow first request', () => {
    const context = mockContext('192.168.1.1');
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow requests within limit', () => {
    const context = mockContext('192.168.1.1');
    expect(guard.canActivate(context)).toBe(true);
    expect(guard.canActivate(context)).toBe(true);
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw when rate limit exceeded', () => {
    const context = mockContext('192.168.1.1');
    guard.canActivate(context);
    guard.canActivate(context);
    guard.canActivate(context);
    expect(() => guard.canActivate(context)).toThrow('Rate limit exceeded');
  });

  it('should reset after window expires', () => {
    const context = mockContext('192.168.1.1');
    const shortGuard = new RateLimitGuard({ maxRequests: 1, windowMs: 50 });
    shortGuard.canActivate(context);
    expect(() => shortGuard.canActivate(context)).toThrow('Rate limit exceeded');
  });

  it('should track different clients separately', () => {
    const ctx1 = mockContext('192.168.1.1');
    const ctx2 = mockContext('192.168.1.2');
    guard.canActivate(ctx1);
    guard.canActivate(ctx1);
    guard.canActivate(ctx1);
    expect(guard.canActivate(ctx2)).toBe(true);
  });

  it('should use default config when none provided', () => {
    const defaultGuard = new RateLimitGuard(undefined);
    expect(defaultGuard).toBeDefined();
  });

  it('should use x-forwarded-for when ip is not available', () => {
    const request = { headers: { 'x-forwarded-for': 'proxy-client' } };
    const context = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as any;
    expect(guard.canActivate(context)).toBe(true);
  });
});
