import { ApiKeyAuthGuard } from './ApiKeyAuth.guard';

describe('ApiKeyAuthGuard', () => {
  let guard: ApiKeyAuthGuard;

  beforeEach(() => {
    guard = new ApiKeyAuthGuard();
    process.env.DATA_API_KEYS = 'demo-key-001,demo-key-002';
  });

  afterEach(() => {
    delete process.env.DATA_API_KEYS;
  });

  const mockContext = (headers: Record<string, string>) => {
    const request = { headers, apiKey: undefined };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as any;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow request with valid API key', () => {
    const context = mockContext({ 'x-api-key': 'demo-key-001' });
    const result = guard.canActivate(context);
    expect(result).toBe(true);
    expect(context.switchToHttp().getRequest().apiKey).toBe('demo-key-001');
  });

  it('should deny request with invalid API key', () => {
    const context = mockContext({ 'x-api-key': 'invalid-key' });
    const result = guard.canActivate(context);
    expect(result).toBe(false);
  });

  it('should deny request with missing API key', () => {
    const context = mockContext({});
    const result = guard.canActivate(context);
    expect(result).toBe(false);
  });

  it('should use default keys when env not set', () => {
    delete process.env.DATA_API_KEYS;
    const guard2 = new ApiKeyAuthGuard();
    const context = mockContext({ 'x-api-key': 'demo-key-001' });
    expect(guard2.canActivate(context)).toBe(true);
  });
});
