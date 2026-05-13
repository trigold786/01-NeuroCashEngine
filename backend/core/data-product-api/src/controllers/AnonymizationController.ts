import { Controller, Post, Get, Body, Query, Logger, InternalServerErrorException } from '@nestjs/common';
import { AnonymizationService, AnonymizedResult, DiversityResult } from '../services/AnonymizationService';

@Controller('data-product/anonymize')
export class AnonymizationController {
  private readonly logger = new Logger(AnonymizationController.name);

  constructor(private readonly anonymizationService: AnonymizationService) {}

  @Post('k-anonymity')
  async applyKAnonymity(
    @Body() body: { data: any[]; quasiIdentifiers: string[]; k: number },
  ): Promise<{ success: boolean; data: AnonymizedResult }> {
    try {
      const result = this.anonymizationService.anonymizeKAnonymity(body.data, body.quasiIdentifiers, body.k);
      return { success: true, data: result };
    } catch (err) {
      this.logger.error('Failed to apply k-anonymity', err);
      throw new InternalServerErrorException('Failed to apply k-anonymity');
    }
  }

  @Post('l-diversity')
  async applyLDiversity(
    @Body() body: { data: any[]; quasiIdentifiers: string[]; sensitiveAttr: string; l: number },
  ): Promise<{ success: boolean; data: DiversityResult }> {
    try {
      const result = this.anonymizationService.anonymizeLDiversity(body.data, body.quasiIdentifiers, body.sensitiveAttr, body.l);
      return { success: true, data: result };
    } catch (err) {
      this.logger.error('Failed to apply l-diversity', err);
      throw new InternalServerErrorException('Failed to apply l-diversity');
    }
  }

  @Post('differential-privacy')
  async addDifferentialPrivacy(
    @Body() body: { value: number; epsilon: number; sensitivity: number },
  ): Promise<{ success: boolean; data: { originalValue: number; noisyValue: number; epsilon: number } }> {
    try {
      const noisyValue = this.anonymizationService.addDifferentialPrivacy(body.value, body.epsilon, body.sensitivity);
      return { success: true, data: { originalValue: body.value, noisyValue, epsilon: body.epsilon } };
    } catch (err) {
      this.logger.error('Failed to add differential privacy', err);
      throw new InternalServerErrorException('Failed to add differential privacy');
    }
  }

  @Get('generalize')
  async generalizeExample(
    @Query('value') value?: string,
    @Query('type') type?: 'age' | 'income' | 'region',
  ): Promise<{ success: boolean; data: { originalValue: string; generalizedValue: string; type: string } }> {
    const examples: { value: string | number; type: 'age' | 'income' | 'region' }[] = [
      { value: 25, type: 'age' },
      { value: 42, type: 'age' },
      { value: 75000, type: 'income' },
      { value: 150000, type: 'income' },
      { value: '北京', type: 'region' },
      { value: '广州', type: 'region' },
    ];

    if (value && type) {
      const parsed = type === 'age' ? parseInt(value, 10) : type === 'income' ? parseFloat(value) : value;
      const generalizedValue = this.anonymizationService.generalizeValue(parsed, type);
      return { success: true, data: { originalValue: value, generalizedValue, type } };
    }

    const allResults = examples.map(ex => ({
      originalValue: String(ex.value),
      generalizedValue: this.anonymizationService.generalizeValue(ex.value, ex.type),
      type: ex.type,
    }));

    return { success: true, data: allResults as any };
  }
}
