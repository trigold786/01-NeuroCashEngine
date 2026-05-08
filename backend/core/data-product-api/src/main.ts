import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataProductService } from './services/DataProductService';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS配置
  app.enableCors();

  // 初始化Demo数据
  const dataProductService = app.get(DataProductService);
  await dataProductService.seedDemoData();

  await app.listen(3007);
  console.log('Data Product API Service is running on port 3007');
}
bootstrap();
