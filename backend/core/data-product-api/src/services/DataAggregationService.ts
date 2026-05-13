import { Injectable, Logger } from '@nestjs/common';

export interface AggregatedData {
  category: string;
  count: number;
  sum: number;
  avg: number;
  min: number;
  max: number;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  count: number;
}

export interface TimeSeriesData {
  interval: string;
  data: TimeSeriesDataPoint[];
}

export interface Statistics {
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  percentile95: number;
}

@Injectable()
export class DataAggregationService {
  private readonly logger = new Logger(DataAggregationService.name);

  aggregateByCategory(data: any[], categoryField: string, valueField: string): AggregatedData[] {
    const groups = new Map<string, number[]>();

    for (const record of data) {
      const category = String(record[categoryField] ?? 'unknown');
      const value = Number(record[valueField]) || 0;
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(value);
    }

    const result: AggregatedData[] = [];
    for (const [category, values] of groups) {
      const sum = values.reduce((s, v) => s + v, 0);
      result.push({
        category,
        count: values.length,
        sum: Math.round(sum * 100) / 100,
        avg: Math.round((sum / values.length) * 100) / 100,
        min: Math.round(Math.min(...values) * 100) / 100,
        max: Math.round(Math.max(...values) * 100) / 100,
      });
    }

    result.sort((a, b) => b.sum - a.sum);
    this.logger.log(`Aggregated by ${categoryField}: ${result.length} categories`);
    return result;
  }

  aggregateByTimeSeries(data: any[], dateField: string, valueField: string, interval: 'day' | 'week' | 'month'): TimeSeriesData {
    const groups = new Map<string, { sum: number; count: number }>();

    for (const record of data) {
      const rawDate = new Date(record[dateField]);
      if (isNaN(rawDate.getTime())) continue;

      let key: string;
      switch (interval) {
        case 'day':
          key = rawDate.toISOString().split('T')[0];
          break;
        case 'week': {
          const start = new Date(rawDate);
          start.setDate(start.getDate() - start.getDay());
          key = start.toISOString().split('T')[0];
          break;
        }
        case 'month':
          key = `${rawDate.getFullYear()}-${String(rawDate.getMonth() + 1).padStart(2, '0')}`;
          break;
        default:
          key = rawDate.toISOString().split('T')[0];
      }

      const value = Number(record[valueField]) || 0;
      if (!groups.has(key)) {
        groups.set(key, { sum: 0, count: 0 });
      }
      const g = groups.get(key)!;
      g.sum += value;
      g.count++;
    }

    const dataPoints: TimeSeriesDataPoint[] = [];
    for (const [date, g] of groups) {
      dataPoints.push({
        date,
        value: Math.round(g.sum * 100) / 100,
        count: g.count,
      });
    }

    dataPoints.sort((a, b) => a.date.localeCompare(b.date));

    this.logger.log(`Aggregated time series by ${interval}: ${dataPoints.length} data points`);
    return { interval, data: dataPoints };
  }

  computeStatistics(data: number[]): Statistics {
    if (data.length === 0) {
      return { mean: 0, median: 0, stdDev: 0, min: 0, max: 0, percentile95: 0 };
    }

    const sorted = [...data].sort((a, b) => a - b);
    const n = sorted.length;
    const mean = sorted.reduce((s, v) => s + v, 0) / n;

    const median = n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];

    const variance = sorted.reduce((s, v) => s + (v - mean) ** 2, 0) / n;
    const stdDev = Math.sqrt(variance);

    const p95Index = Math.ceil(0.95 * n) - 1;
    const percentile95 = sorted[Math.max(0, p95Index)];

    this.logger.log(`Computed statistics on ${n} values: mean=${mean.toFixed(2)}, median=${median}, stdDev=${stdDev.toFixed(2)}`);
    return {
      mean: Math.round(mean * 100) / 100,
      median: Math.round(median * 100) / 100,
      stdDev: Math.round(stdDev * 100) / 100,
      min: sorted[0],
      max: sorted[n - 1],
      percentile95,
    };
  }
}
