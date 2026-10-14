import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SseController } from './events/sse.controller';
import { UsersModule } from './users/users.module';

const isProduction = process.env.NODE_ENV === 'production';
const synchronizeDatabase = process.env.DB_SYNCHRONIZE
  ? process.env.DB_SYNCHRONIZE === 'true'
  : !isProduction;

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'database.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      // 开发环境默认同步表结构；生产环境默认关闭，应使用迁移管理数据库。
      synchronize: synchronizeDatabase,
    }),
    UsersModule,
  ],
  controllers: [AppController, SseController],
  providers: [AppService],
})
export class AppModule {}
