import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

/**
 * 启动函数
 * 初始化和启动 NestJS 应用
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 配置全局验证管道，用于 DTO 数据验证
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // 自动删除未在 DTO 中定义的属性
    forbidNonWhitelisted: false, // 不拒绝额外字段，只删除它们
    transform: true, // 自动将请求体转换为 DTO 类的实例
  }));

  // 配置 CORS，允许前端访问后端 API
  app.enableCors({
    origin: 'http://localhost:4200', // Angular 前端的默认端口
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 启动应用，监听 3000 端口
  await app.listen(3000);
  console.log('NestJS application is running on: http://localhost:3000');
}
bootstrap();
