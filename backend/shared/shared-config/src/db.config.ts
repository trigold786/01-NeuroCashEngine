import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function getDatabaseConfig(entities: any[]): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'nce_root_123',
    database: process.env.DB_NAME || 'nce_db',
    entities,
    synchronize: process.env.NODE_ENV === 'development', // 只在开发环境自动同步
    logging: process.env.NODE_ENV !== 'production',
  };
}
