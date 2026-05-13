import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

describe('UserService', () => {
  let service: UserService;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      phone: '13800138000',
      password: 'Password123',
      username: 'testuser',
    };

    it('should register a new user successfully', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      mockRepository.create.mockReturnValue({ id: 'user-1', ...registerDto });
      mockRepository.save.mockResolvedValue({ id: 'user-1', email: registerDto.email });

      const result = await service.register(registerDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: registerDto.email } });
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
      expect(result.id).toBe('user-1');
    });

    it('should throw ConflictException when email already exists', async () => {
      mockRepository.findOne.mockResolvedValue({ id: 'existing-user', email: registerDto.email });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when phone already exists', async () => {
      mockRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: 'existing-user', phone: registerDto.phone });

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com', password: 'hashed', role: 'user', accountType: 'standard' };
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toBeDefined();
      expect(result?.email).toBe('test@example.com');
    });

    it('should return null when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('user-1');

      expect(result).toBeDefined();
      expect(result.id).toBe('user-1');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login time', async () => {
      mockRepository.update.mockResolvedValue({ affected: 1 });

      await expect(service.updateLastLogin('user-1')).resolves.not.toThrow();
      expect(mockRepository.update).toHaveBeenCalledWith('user-1', { lastLoginAt: expect.any(Date) });
    });
  });
});