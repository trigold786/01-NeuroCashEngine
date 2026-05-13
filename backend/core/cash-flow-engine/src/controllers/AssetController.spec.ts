import { Test, TestingModule } from '@nestjs/testing';
import { AssetController } from './AssetController';
import { AssetService } from '../services/AssetService';
import { CreateAssetAccountDto } from '../dto/CreateAssetAccount.dto';

describe('AssetController', () => {
  let controller: AssetController;
  let service: AssetService;

  const mockAssetService = {
    getAssetOverview: jest.fn(),
    getAccounts: jest.fn(),
    createAccount: jest.fn(),
    getAccountById: jest.fn(),
    deleteAccount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetController],
      providers: [
        {
          provide: AssetService,
          useValue: mockAssetService,
        },
      ],
    }).compile();

    controller = module.get<AssetController>(AssetController);
    service = module.get<AssetService>(AssetService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getOverview', () => {
    it('should return asset overview for user', async () => {
      const mockOverview = {
        total: 10000,
        distribution: { '现金': 5000, '存款': 3000, '基金': 2000 },
        chartData: [],
        accountCount: 3,
        accounts: [],
      };
      mockAssetService.getAssetOverview.mockResolvedValue(mockOverview);

      const req = { user: { id: 'user-1' } };
      const result = await controller.getOverview(req);

      expect(mockAssetService.getAssetOverview).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockOverview);
    });
  });

  describe('getAccounts', () => {
    it('should return accounts for user', async () => {
      const mockAccounts = [
        { id: 'acc-1', accountName: '账户1', balance: 5000 },
        { id: 'acc-2', accountName: '账户2', balance: 3000 },
      ];
      mockAssetService.getAccounts.mockResolvedValue(mockAccounts);

      const req = { user: { id: 'user-1' } };
      const result = await controller.getAccounts(req);

      expect(mockAssetService.getAccounts).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockAccounts);
    });
  });

  describe('createAccount', () => {
    it('should create account successfully', async () => {
      const dto: CreateAssetAccountDto = {
        accountName: '新账户',
        accountType: 'CASH',
        balance: 10000,
      };
      const mockAccount = { id: 'acc-new', ...dto };
      mockAssetService.createAccount.mockResolvedValue(mockAccount);

      const req = { user: { id: 'user-1' } };
      const result = await controller.createAccount(dto, req);

      expect(mockAssetService.createAccount).toHaveBeenCalledWith('user-1', dto);
      expect(result).toEqual(mockAccount);
    });
  });

  describe('getAccount', () => {
    it('should return account by id', async () => {
      const mockAccount = { id: 'acc-1', accountName: '账户1', balance: 5000 };
      mockAssetService.getAccountById.mockResolvedValue(mockAccount);

      const req = { user: { id: 'user-1' } };
      const result = await controller.getAccount('acc-1', req);

      expect(mockAssetService.getAccountById).toHaveBeenCalledWith('acc-1', 'user-1');
      expect(result).toEqual(mockAccount);
    });
  });

  describe('deleteAccount', () => {
    it('should delete account and return success', async () => {
      mockAssetService.deleteAccount.mockResolvedValue(undefined);

      const req = { user: { id: 'user-1' } };
      const result = await controller.deleteAccount('acc-1', req);

      expect(mockAssetService.deleteAccount).toHaveBeenCalledWith('acc-1', 'user-1');
      expect(result).toEqual({ success: true });
    });
  });
});