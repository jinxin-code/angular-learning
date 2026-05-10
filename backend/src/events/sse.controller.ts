import { Controller, Sse, Get } from '@nestjs/common';
import { Observable, interval } from 'rxjs';

/**
 * SSE 控制器
 * 用于向前端发送实时事件通知
 * 使用 Server-Sent Events 实现单向实时通信
 */
@Controller('events')
export class SseController {
  /**
   * SSE 流端点
   * 保持连接打开，定期发送心跳和状态更新
   */
  @Get('stream')
  @Sse()
  stream(): Observable<MessageEvent> {
    return new Observable(observer => {
      // 立即发送后端启动通知
      observer.next({
        data: JSON.stringify({
          message: 'Backend service started',
          timestamp: new Date().toISOString(),
          type: 'startup'
        }),
      } as MessageEvent);

      console.log('SSE 连接已建立，已发送后端启动通知');

      // 定期发送心跳（每30秒），保持连接活跃
      const heartbeatInterval = interval(30000);
      const subscription = heartbeatInterval.subscribe(() => {
        observer.next({
          data: JSON.stringify({
            message: 'Heartbeat',
            timestamp: new Date().toISOString(),
            type: 'heartbeat'
          }),
        } as MessageEvent);
      });

      // 清理函数
      return () => {
        subscription.unsubscribe();
        console.log('SSE 连接已关闭');
      };
    });
  }
}
