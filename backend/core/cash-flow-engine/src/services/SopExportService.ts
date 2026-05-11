import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneratedSop } from '../entities/GeneratedSop.entity';
import { CashFlowForecast } from '../entities/CashFlowForecast.entity';

@Injectable()
export class SopExportService {
  constructor(
    @InjectRepository(GeneratedSop)
    private readonly sopRepository: Repository<GeneratedSop>,
    @InjectRepository(CashFlowForecast)
    private readonly forecastRepository: Repository<CashFlowForecast>,
  ) {}

  async generateMarkdown(sopId: string, userId: string): Promise<string> {
    const sop = await this.sopRepository.findOne({
      where: { sopId, userId },
    });

    if (!sop) {
      throw new Error('SOP not found');
    }

    const forecasts = await this.forecastRepository.find({
      where: { userId },
      order: { forecastDate: 'ASC' },
    });

    const alertForecast = forecasts.find(f => f.isAlert);

    let markdown = `# ${sop.title}\n\n`;
    markdown += `**创建时间**: ${new Date(sop.createdAt).toLocaleString('zh-CN')}\n\n`;

    if (alertForecast) {
      markdown += `**预警日期**: ${alertForecast.forecastDate}\n`;
      markdown += `**预测余额**: ¥${alertForecast.predictedBalance.toFixed(2)}\n\n`;
    }

    markdown += `---\n\n`;
    markdown += sop.content;

    return markdown;
  }

  async generatePdf(sopId: string, userId: string): Promise<string> {
    const markdown = await this.generateMarkdown(sopId, userId);

    const html = this.markdownToHtml(markdown);

    return html;
  }

  private markdownToHtml(markdown: string): string {
    let html = markdown
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/^\*\*(.+)\*\*$/gm, '<strong>$1</strong>')
      .replace(/^---$/gm, '<hr/>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br/>');

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>SOP Document</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; line-height: 1.6; }
    h1 { color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
    h2 { color: #555; margin-top: 24px; }
    li { margin: 8px 0; }
    hr { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
    strong { color: #0066cc; }
  </style>
</head>
<body>
${html}
</body>
</html>`;
  }
}