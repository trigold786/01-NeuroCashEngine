import { OAuthGuard } from './OAuthGuard';

describe('OAuthGuard', () => {
  let guard: OAuthGuard;

  beforeEach(() => {
    guard = new OAuthGuard();
  });

  const mockContext = (authorization?: string) => {
    const request = { headers: { authorization } };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as any;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow request with valid Bearer token', () => {
    const context = mockContext('Bearer some-valid-token');
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should deny request without Bearer token', () => {
    const context = mockContext('Basic credentials');
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should deny request without authorization header', () => {
    const context = mockContext(undefined);
    expect(guard.canActivate(context)).toBe(false);
  });

  it('should allow request with empty Bearer token', () => {
    const context = mockContext('Bearer ');
    expect(guard.canActivate(context)).toBe(true);
  });
});
