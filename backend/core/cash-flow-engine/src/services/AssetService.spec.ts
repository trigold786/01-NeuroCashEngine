import { Test, TestingModule } from '@nestjs/testing';
import { AssetService } from './AssetService';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserAssetAccount, AccountType } from '../entities/UserAssetAccount.entity';
import { CashFlowRecord } from '../entities/CashFlowRecord.entity';

jest.mock('../utils/crypto.util', () => ({
  encryptBalance: jest.fn((balance) => `encrypted_${balance}`),
  decryptBalance: jest.fn((encrypted) => {
    if (typeof encrypted === 'string' && encrypted.startsWith('encrypted_')) {
      return parseFloat(encrypted.replace('encrypted_', ''));
    }
    return 0;
  }),
}));

describe('AssetService', () => {
  let service: AssetService;

  const mockAccountRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  };

  const mockRecordRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetService,
        {
          provide: getRepositoryToken(UserAssetAccount),
          useValue: mockAccountRepository,
        },
        {
          provide: getRepositoryToken(CashFlowRecord),
          useValue: mockRecordRepository,
        },
      ],
    }).compile();

    service = module.get<AssetService>(AssetService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('convertAccountType', () => {
    it('should convert CASH string to AccountType.CASH', () => {
      expect(service.convertAccountType('CASH')).toBe(AccountType.CASH);
    });

    it('should convert DEPOSIT string to AccountType.DEPOSIT', () => {
      expect(service.convertAccountType('DEPOSIT')).toBe(AccountType.DEPOSIT);
    });

    it('should convert FUND string to AccountType.FUND', () => {
      expect(service.convertAccountType('FUND')).toBe(AccountType.FUND);
    });

    it('should convert STOCK string to AccountType.STOCK', () => {
      expect(service.convertAccountType('STOCK')).toBe(AccountType.STOCK);
    });

    it('should default to CASH for unknown types', () => {
      expect(service.convertAccountType('UNKNOWN')).toBe(AccountType.CASH);
    });
  });

  describe('formatAccount', () => {
    it('should format account with decrypted balance', () => {
      const mockAccount = {
        accountId: 'acc-123',
        userId: 'user-1',
        accountName: '测试账户',
        accountType: AccountType.CASH,
        encryptedBalance: 'encrypted_value',
        authStatus: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.formatAccount(mockAccount as UserAssetAccount);

      expect(result.id).toBe('acc-123');
      expect(result.accountTypeName).toBe('现金');
      expect(result.balance).toBeDefined();
    });
  });

  describe('createAccount', () => {
    it('should create a new account successfully', async () => {
      const userId = 'user-1';
      const dto = {
        accountName: '我的现金账户',
        accountType: 'CASH',
        balance: 10000,
      };

      mockAccountRepository.create.mockReturnValue({ ...dto, userId });
      mockAccountRepository.save.mockResolvedValue({
        accountId: 'acc-new',
        userId,
        accountName: '我的现金账户',
        accountType: AccountType.CASH,
        encryptedBalance: 'encrypted',
      });

      const result = await service.createAccount(userId, dto);

      expect(mockAccountRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.accountName).toBe('我的现金账户');
    });

    it('should create DEPOSIT account with term and interest rate', async () => {
      const userId = 'user-1';
      const dto = {
        accountName: '定期存款',
        accountType: 'DEPOSIT',
        balance: 50000,
        institutionCode: 'ICBC',
        termYears: 3,
        interestRate: 2.75,
        startDate: '2024-01-01',
        endDate: '2027-01-01',
      };

      mockAccountRepository.create.mockReturnValue({ ...dto, userId });
      mockAccountRepository.save.mockResolvedValue({
        accountId: 'acc-deposit',
        userId,
        accountName: '定期存款',
        accountType: AccountType.DEPOSIT,
        encryptedBalance: 'encrypted',
        institutionCode: 'ICBC',
        termYears: 3,
        interestRate: 2.75,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2027-01-01'),
      });

      const result = await service.createAccount(userId, dto);

      expect(mockAccountRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.accountName).toBe('定期存款');
      expect(result.termYears).toBe(3);
      expect(result.interestRate).toBe(2.75);
    });

    it('should create FUND account with fund details', async () => {
      const userId = 'user-1';
      const dto = {
        accountName: '我的基金',
        accountType: 'FUND',
        balance: 10000,
        fundCode: '110022',
        fundName: '易方达消费行业股票',
        buyPrice: 1.5,
        buyDate: '2024-01-15',
        shareCount: 5000,
        nav: 1.8,
      };

      mockAccountRepository.create.mockReturnValue({ ...dto, userId });
      mockAccountRepository.save.mockResolvedValue({
        accountId: 'acc-fund',
        userId,
        accountName: '我的基金',
        accountType: AccountType.FUND,
        encryptedBalance: 'encrypted',
        fundCode: '110022',
        fundName: '易方达消费行业股票',
        buyPrice: 1.5,
        buyDate: new Date('2024-01-15'),
        shareCount: 5000,
        nav: 1.8,
      });

      const result = await service.createAccount(userId, dto);

      expect(mockAccountRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.fundCode).toBe('110022');
      expect(result.fundName).toBe('易方达消费行业股票');
      expect(result.shareCount).toBe(5000);
    });

    it('should create STOCK account with stock details', async () => {
      const userId = 'user-1';
      const dto = {
        accountName: '我的股票',
        accountType: 'STOCK',
        balance: 50000,
        stockCode: '600519',
        stockName: '贵州茅台',
        buyPrice: 1500,
        buyDate: '2024-01-10',
        shareCount: 100,
        currentPrice: 1800,
      };

      mockAccountRepository.create.mockReturnValue({ ...dto, userId });
      mockAccountRepository.save.mockResolvedValue({
        accountId: 'acc-stock',
        userId,
        accountName: '我的股票',
        accountType: AccountType.STOCK,
        encryptedBalance: 'encrypted',
        stockCode: '600519',
        stockName: '贵州茅台',
        buyPrice: 1500,
        buyDate: new Date('2024-01-10'),
        shareCount: 100,
        currentPrice: 1800,
      });

      const result = await service.createAccount(userId, dto);

      expect(mockAccountRepository.save).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(result.stockCode).toBe('600519');
      expect(result.stockName).toBe('贵州茅台');
      expect(result.shareCount).toBe(100);
      expect(result.currentPrice).toBe(1800);
    });
  });

  describe('getAccounts', () => {
    it('should return formatted accounts for user', async () => {
      const userId = 'user-1';
      const mockAccounts = [
        {
          accountId: 'acc-1',
          userId,
          accountName: '账户1',
          accountType: AccountType.CASH,
          encryptedBalance: 'enc1',
        },
      ];

      mockAccountRepository.find.mockResolvedValue(mockAccounts);

      const result = await service.getAccounts(userId);

      expect(mockAccountRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getAssetOverview', () => {
    it('should return overview with total and distribution', async () => {
      const userId = 'user-1';
      const mockAccounts = [
        {
          accountId: 'acc-1',
          userId,
          accountName: '现金账户',
          accountType: AccountType.CASH,
          encryptedBalance: 'enc1',
        },
      ];

      mockAccountRepository.find.mockResolvedValue(mockAccounts);

      const result = await service.getAssetOverview(userId);

      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('distribution');
      expect(result).toHaveProperty('chartData');
      expect(result).toHaveProperty('accountCount');
    });
  });

  describe('getAccountById', () => {
    it('should return formatted account by id', async () => {
      const accountId = 'acc-123';
      const userId = 'user-1';

      mockAccountRepository.findOne.mockResolvedValue({
        accountId,
        userId,
        accountName: '测试账户',
        accountType: AccountType.CASH,
        encryptedBalance: 'enc',
      });

      const result = await service.getAccountById(accountId, userId);

      expect(result).toBeDefined();
      expect(result.id).toBe(accountId);
    });

    it('should throw NotFoundException when account not found', async () => {
      mockAccountRepository.findOne.mockResolvedValue(null);

      await expect(service.getAccountById('non-existent', 'user-1'))
        .rejects.toThrow();
    });
  });

  describe('deleteAccount', () => {
    it('should delete account successfully', async () => {
      mockAccountRepository.delete.mockResolvedValue({ affected: 1 });

      await expect(service.deleteAccount('acc-1', 'user-1')).resolves.not.toThrow();
    });

    it('should throw NotFoundException when account not found', async () => {
      mockAccountRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.deleteAccount('non-existent', 'user-1'))
        .rejects.toThrow();
    });
  });
});