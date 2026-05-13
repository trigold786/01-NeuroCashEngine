import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { BusinessCashFlowService } from './BusinessCashFlowService';

interface RefreshTimer {
  timer: NodeJS.Timeout;
  intervalMs: number;
}

@Injectable()
export class SchedulerService implements OnModuleDestroy {
  private readonly logger = new Logger(SchedulerService.name);
  private refreshTimers = new Map<string, RefreshTimer>();

  constructor(
    private readonly businessCashFlowService: BusinessCashFlowService,
  ) {}

  startDataRefresh(userId: string, intervalMinutes: number): void {
    this.stopDataRefresh(userId);
    const intervalMs = intervalMinutes * 60 * 1000;
    this.logger.log(`Starting data refresh for user ${userId} every ${intervalMinutes} minutes`);
    const timer = setInterval(async () => {
      try {
        this.logger.log(`Scheduled refresh for user ${userId}`);
        await this.businessCashFlowService.generateForecast(userId, { forecastDays: 90 });
      } catch (err) {
        this.logger.error(`Scheduled refresh failed for user ${userId}`, err);
      }
    }, intervalMs);
    this.refreshTimers.set(userId, { timer, intervalMs });
  }

  stopDataRefresh(userId: string): void {
    const existing = this.refreshTimers.get(userId);
    if (existing) {
      clearInterval(existing.timer);
      this.refreshTimers.delete(userId);
      this.logger.log(`Stopped data refresh for user ${userId}`);
    }
  }

  isRefreshing(userId: string): boolean {
    return this.refreshTimers.has(userId);
  }

  getRefreshInfo(userId: string): { intervalMinutes: number } | null {
    const info = this.refreshTimers.get(userId);
    if (!info) return null;
    return { intervalMinutes: info.intervalMs / (60 * 1000) };
  }

  onModuleDestroy(): void {
    for (const [userId, info] of this.refreshTimers) {
      clearInterval(info.timer);
    }
    this.refreshTimers.clear();
  }
}
