import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserService = {
    register: jest.fn(),
    findByEmail: jest.fn(),
    updateLastLogin: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register user and return token', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'Password123',
        username: 'testuser',
      };
      const mockUser = { id: 'user-1', email: 'test@example.com', username: 'testuser', password: 'hashed' };
      mockUserService.register.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(registerDto);

      expect(mockUserService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result.accessToken).toBe('jwt-token');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException when user not found', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(service.login({ email: 'test@example.com', password: 'Password123' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com', password: 'hashed' };
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ email: 'test@example.com', password: 'WrongPassword' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should return user and token when credentials are valid', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com', password: 'hashed', role: 'user' };
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockUserService.updateLastLogin.mockResolvedValue(undefined);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login({ email: 'test@example.com', password: 'Password123' });

      expect(mockUserService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockUserService.updateLastLogin).toHaveBeenCalledWith('user-1');
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result.accessToken).toBe('jwt-token');
    });
  });
});