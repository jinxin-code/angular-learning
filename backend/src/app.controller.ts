import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * 应用控制器
 * 处理根路径的 HTTP 请求
 */
@Controller()
export class AppController {
  /**
   * 构造函数
   * @param appService 应用服务实例
   */
  constructor(private readonly appService: AppService) {}

  /**
   * 处理 GET 请求，返回欢迎信息
   * @returns 欢迎信息字符串
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
