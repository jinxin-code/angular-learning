/**
 * ToastService - Toast 消息服务
 *
 * ===== Angular 依赖注入 (DI) =====
 *
 * 服务使用 @Injectable({ providedIn: 'root' })
 * 整个应用共享单例，通过构造函数注入到组件
 *
 * ===== RxJS Subject =====
 *
 * BehaviorSubject - 特殊 Subject，可以记住当前值
 * 新订阅者立即收到最新发射的值
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { ToastMessage } from '../toast/toast.component';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  /** BehaviorSubject 保持当前的消息列表 */
  private messagesSubject = new BehaviorSubject<ToastMessage[]>([]);
  /** 对外暴露的 Observable，组件可以订阅 */
  messages$ = this.messagesSubject.asObservable();
  /** 消息 ID 计数器 */
  private idCounter = 0;

  /**
   * 显示成功消息
   * @param message - 要显示的消息内容
   */
  success(message: string): void {
    this.show(message, 'success');
  }

  /**
   * 显示错误消息
   * @param message - 要显示的消息内容
   */
  error(message: string): void {
    this.show(message, 'error');
  }

  /**
   * 显示警告消息
   * @param message - 要显示的消息内容
   */
  warning(message: string): void {
    this.show(message, 'warning');
  }

  /**
   * 显示信息消息
   * @param message - 要显示的消息内容
   */
  info(message: string): void {
    this.show(message, 'info');
  }

  /**
   * 内部方法：显示消息
   * @param message - 消息内容
   * @param type - 消息类型
   */
  private show(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    /** 创建新消息对象 */
    const newMessage: ToastMessage = {
      id: ++this.idCounter,
      message,
      type
    };

    /** 获取当前消息列表并添加新消息 */
    const currentMessages = this.messagesSubject.getValue();
    this.messagesSubject.next([...currentMessages, newMessage]);
  }

  /** 清空所有消息 */
  clear(): void {
    this.messagesSubject.next([]);
  }
}
