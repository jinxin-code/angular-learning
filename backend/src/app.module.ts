import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatusGateway } from './gateway/status.gateway';

/**
 * 主应用模块
 * 导入和组织所有子模块
 */
@Module({
  imports: [
    // 配置 TypeORM 连接 SQLite 数据库
    // synchronize: true 自动同步数据库表结构（开发环境使用）
    // 数据库文件会创建在项目根目录的 database.sqlite 文件中
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'database.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, StatusGateway],
})
export class AppModule {}
