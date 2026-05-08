import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { BusinessCashFlowService } from './services/BusinessCashFlowService';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  app.enableCors();
  
  const businessService = app.get(BusinessCashFlowService);
  await businessService.initializeIndustryData();
  await businessService.initializeSopTemplates();
  
  await app.listen(3005);
  console.log('Cash Flow Engine is running on port 3005');
}
bootstrap();
