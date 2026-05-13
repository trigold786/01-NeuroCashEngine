import { Controller, Post, Body, Logger, InternalServerErrorException } from '@nestjs/common';
import { DataAggregationService, AggregatedData, TimeSeriesData, Statistics } from '../services/DataAggregationService';

@Controller('data-product/aggregate')
export class DataAggregationController {
  private readonly logger = new Logger(DataAggregationController.name);

  constructor(private readonly dataAggregationService: DataAggregationService) {}

  @Post('category')
  async aggregateByCategory(
    @Body() body: { data: any[]; categoryField: string; valueField: string },
  ): Promise<{ success: boolean; data: AggregatedData[] }> {
    try {
      const result = this.dataAggregationService.aggregateByCategory(body.data, body.categoryField, body.valueField);
      return { success: true, data: result };
    } catch (err) {
      this.logger.error('Failed to aggregate by category', err);
      throw new InternalServerErrorException('Failed to aggregate by category');
    }
  }

  @Post('timeseries')
  async aggregateByTimeSeries(
    @Body() body: { data: any[]; dateField: string; valueField: string; interval: 'day' | 'week' | 'month' },
  ): Promise<{ success: boolean; data: TimeSeriesData }> {
    try {
      const result = this.dataAggregationService.aggregateByTimeSeries(body.data, body.dateField, body.valueField, body.interval);
      return { success: true, data: result };
    } catch (err) {
      this.logger.error('Failed to aggregate time series', err);
      throw new InternalServerErrorException('Failed to aggregate time series');
    }
  }

  @Post('statistics')
  async computeStatistics(
    @Body() body: { data: number[] },
  ): Promise<{ success: boolean; data: Statistics }> {
    try {
      const result = this.dataAggregationService.computeStatistics(body.data);
      return { success: true, data: result };
    } catch (err) {
      this.logger.error('Failed to compute statistics', err);
      throw new InternalServerErrorException('Failed to compute statistics');
    }
  }
}
