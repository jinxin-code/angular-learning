import { Injectable } from '@nestjs/common';

/**
 * 应用服务
 * 提供应用级别的业务逻辑
 */
@Injectable()
export class AppService {
  /**
   * 获取欢迎信息
   * @returns 欢迎信息字符串
   */
  getHello(): string {
    return 'Hello World!';
  }
}
