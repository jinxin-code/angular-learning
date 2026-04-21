import { WebSocketGateway, WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
import { Server } from 'socket.io';

/**
 * 状态网关
 * 用于向后端发送后端服务状态通知
 */
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:4200', 'http://localhost:56307'],
  },
})
export class StatusGateway implements OnGatewayInit {
  /**
   * WebSocket 服务器实例
   */
  @WebSocketServer()
  server: Server;

  /**
   * 网关初始化完成后调用
   * 发送后端启动通知
   */
  afterInit() {
    // 当 WebSocket 服务初始化完成后，发送后端启动通知
    setTimeout(() => {
      this.server.emit('backend-started', {
        message: 'Backend service started',
        timestamp: new Date().toISOString(),
      });
      console.log('已发送后端启动通知');
    }, 1000);
  }
}
