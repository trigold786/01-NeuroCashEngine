import { Test, TestingModule } from '@nestjs/testing';
import { BusinessCashFlowController } from './BusinessCashFlowController';
import { BusinessCashFlowService } from '../services/BusinessCashFlowService';
import { SopExportService } from '../services/SopExportService';
import { GenerateForecastDto } from '../dto/GenerateForecast.dto';
import { GenerateSopDto } from '../dto/GenerateSop.dto';
import { SopType } from '../entities/SopTemplate.entity';

describe('BusinessCashFlowController', () => {
  let controller: BusinessCashFlowController;
  let service: BusinessCashFlowService;

  const mockService = {
    generateForecast: jest.fn(),
    getForecast: jest.fn(),
    generateSop: jest.fn(),
    getSops: jest.fn(),
    getSopById: jest.fn(),
    deleteSop: jest.fn(),
    getIndustries: jest.fn(),
  };

  const mockSopExportService = {
    generateMarkdown: jest.fn(),
    generatePdf: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessCashFlowController],
      providers: [
        {
          provide: BusinessCashFlowService,
          useValue: mockService,
        },
        {
          provide: SopExportService,
          useValue: mockSopExportService,
        },
      ],
    }).compile();

    controller = module.get<BusinessCashFlowController>(BusinessCashFlowController);
    service = module.get<BusinessCashFlowService>(BusinessCashFlowService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generateForecast', () => {
    it('should generate forecast for user', async () => {
      const dto: GenerateForecastDto = { forecastDays: 90 };
      const mockForecasts = [{ date: '2026-05-15', predictedBalance: 10000 }];
      mockService.generateForecast.mockResolvedValue(mockForecasts);

      const req = { user: { id: 'user-1' } };
      const result = await controller.generateForecast(dto, req);

      expect(mockService.generateForecast).toHaveBeenCalledWith('user-1', dto);
      expect(result).toEqual(mockForecasts);
    });

    it('should use demo-user-1 when no user in request', async () => {
      mockService.generateForecast.mockResolvedValue([]);

      const req = {};
      await controller.generateForecast({}, req);

      expect(mockService.generateForecast).toHaveBeenCalledWith('demo-user-1', {});
    });
  });

  describe('getForecast', () => {
    it('should return forecasts for user', async () => {
      const mockForecasts = [
        { date: '2026-05-10', predictedBalance: 10000 },
        { date: '2026-05-11', predictedBalance: 9500 },
      ];
      mockService.getForecast.mockResolvedValue(mockForecasts);

      const req = { user: { id: 'user-1' } };
      const result = await controller.getForecast(req);

      expect(mockService.getForecast).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockForecasts);
    });
  });

  describe('generateSop', () => {
    it('should generate SOP for user', async () => {
      const dto: GenerateSopDto = { type: SopType.SHORTAGE };
      const mockSop = { sopId: 'sop-1', title: '资金短缺应对SOP' };
      mockService.generateSop.mockResolvedValue(mockSop);

      const req = { user: { id: 'user-1' } };
      const result = await controller.generateSop(dto, req);

      expect(mockService.generateSop).toHaveBeenCalledWith('user-1', dto);
      expect(result).toEqual(mockSop);
    });
  });

  describe('getSops', () => {
    it('should return SOPs for user', async () => {
      const mockSops = [
        { sopId: 'sop-1', title: 'SOP 1' },
        { sopId: 'sop-2', title: 'SOP 2' },
      ];
      mockService.getSops.mockResolvedValue(mockSops);

      const req = { user: { id: 'user-1' } };
      const result = await controller.getSops(req);

      expect(mockService.getSops).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(mockSops);
    });
  });

  describe('getSopById', () => {
    it('should return SOP by id', async () => {
      const mockSop = { sopId: 'sop-1', title: 'SOP 1' };
      mockService.getSopById.mockResolvedValue(mockSop);

      const req = { user: { id: 'user-1' } };
      const result = await controller.getSopById('sop-1', req);

      expect(mockService.getSopById).toHaveBeenCalledWith('sop-1', 'user-1');
      expect(result).toEqual(mockSop);
    });
  });

  describe('deleteSop', () => {
    it('should delete SOP and return success', async () => {
      mockService.deleteSop.mockResolvedValue(undefined);

      const req = { user: { id: 'user-1' } };
      const result = await controller.deleteSop('sop-1', req);

      expect(mockService.deleteSop).toHaveBeenCalledWith('sop-1', 'user-1');
      expect(result).toEqual({ success: true });
    });
  });

  describe('getIndustries', () => {
    it('should return all industries', async () => {
      const mockIndustries = [
        { industryCode: 51, industryName: '批发业' },
        { industryCode: 52, industryName: '零售业' },
      ];
      mockService.getIndustries.mockResolvedValue(mockIndustries);

      const result = await controller.getIndustries();

      expect(mockService.getIndustries).toHaveBeenCalled();
      expect(result).toEqual(mockIndustries);
    });
  });

  describe('exportSopPdf', () => {
    it('should export SOP as PDF', async () => {
      const mockHtml = '<html>SOP</html>';
      mockSopExportService.generatePdf.mockResolvedValue(mockHtml);

      const req = { user: { id: 'user-1' } };
      const mockRes = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      await controller.exportSopPdf('sop-1', req, mockRes);

      expect(mockSopExportService.generatePdf).toHaveBeenCalledWith('sop-1', 'user-1');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/html; charset=utf-8');
      expect(mockRes.send).toHaveBeenCalledWith(mockHtml);
    });
  });

  describe('exportSopMarkdown', () => {
    it('should export SOP as Markdown', async () => {
      const mockMarkdown = '# SOP Content';
      mockSopExportService.generateMarkdown.mockResolvedValue(mockMarkdown);

      const req = { user: { id: 'user-1' } };
      const mockRes = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      await controller.exportSopMarkdown('sop-1', req, mockRes);

      expect(mockSopExportService.generateMarkdown).toHaveBeenCalledWith('sop-1', 'user-1');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/markdown; charset=utf-8');
      expect(mockRes.send).toHaveBeenCalledWith(mockMarkdown);
    });
  });
});