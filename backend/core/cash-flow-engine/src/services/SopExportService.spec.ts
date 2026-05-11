import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SopExportService } from './SopExportService';
import { GeneratedSop } from '../entities/GeneratedSop.entity';
import { CashFlowForecast } from '../entities/CashFlowForecast.entity';

describe('SopExportService', () => {
  let service: SopExportService;

  const mockSopRepository = { findOne: jest.fn() };
  const mockForecastRepository = { find: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SopExportService,
        { provide: getRepositoryToken(GeneratedSop), useValue: mockSopRepository },
        { provide: getRepositoryToken(CashFlowForecast), useValue: mockForecastRepository },
      ],
    }).compile();

    service = module.get<SopExportService>(SopExportService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateMarkdown', () => {
    it('should generate markdown with forecast data', async () => {
      const mockSop = {
        sopId: 'sop-1',
        userId: 'user-1',
        title: 'Test SOP',
        content: '# SOP Content\n- Item 1',
        createdAt: new Date('2024-01-15'),
      };
      const mockForecasts = [
        { forecastDate: '2024-01-15', predictedBalance: 45000, isAlert: true },
      ];

      mockSopRepository.findOne.mockResolvedValue(mockSop);
      mockForecastRepository.find.mockResolvedValue(mockForecasts);

      const result = await service.generateMarkdown('sop-1', 'user-1');

      expect(result).toContain('# Test SOP');
      expect(result).toContain('45000.00');
      expect(result).toContain('2024-01-15');
    });

    it('should throw error when SOP not found', async () => {
      mockSopRepository.findOne.mockResolvedValue(null);

      await expect(service.generateMarkdown('non-existent', 'user-1'))
        .rejects.toThrow('SOP not found');
    });
  });

  describe('generatePdf', () => {
    it('should generate HTML document', async () => {
      const mockSop = {
        sopId: 'sop-1',
        userId: 'user-1',
        title: 'Test SOP',
        content: '# SOP Content',
        createdAt: new Date('2024-01-15'),
      };
      const mockForecasts = [];

      mockSopRepository.findOne.mockResolvedValue(mockSop);
      mockForecastRepository.find.mockResolvedValue(mockForecasts);

      const result = await service.generatePdf('sop-1', 'user-1');

      expect(result).toContain('<!DOCTYPE html>');
      expect(result).toContain('Test SOP');
    });
  });
});