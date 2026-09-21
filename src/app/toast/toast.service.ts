/**
 * ToastService - Toast 消息服务
 *
 * ===== Angular 信号 (Signal) 改造 =====
 *
 * 原实现使用 RxJS BehaviorSubject 持有消息列表，组件需要 subscribe。
 * 现改用 signal() 持有状态，组件可直接读取 signal（无需订阅/退订）。
 *
 * 【signal vs BehaviorSubject】
 * - signal 更轻量，专为「响应式状态」设计
 * - 读取 signal() 会自动建立依赖，computed/模板会自动追踪
 * - 无需手动 takeUntil/destroy，signal 本身随组件生命周期回收
 *
 * 【对外暴露】
 * messages 是一个 WritableSignal，但约定外部只读。
 * 写入统一走 success/error/warning/info/clear 等方法。
 */
import { Injectable, signal } from '@angular/core';

import { ToastMessage } from '../toast/toast.component';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  /**
   * messages - 消息列表 signal
   *
   * signal<T>(initial) 创建一个可写信号
   * 读取值：messages()
   * 写入值：messages.set(newValue) 或 messages.update(prev => newValue)
   */
  readonly messages = signal<ToastMessage[]>([]);

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

    /**
     * signal.update(fn) - 基于前值更新信号
     * 这里将新消息追加到列表末尾
     */
    this.messages.update(list => [...list, newMessage]);
  }

  /** 清空所有消息 */
  clear(): void {
    this.messages.set([]);
  }

  /**
   * 按 id 移除单条消息
   *
   * 【为何需要】
   * ToastComponent 在 toast 被关闭/自动消失时回调此方法，
   * 从源头删除该消息，使后续 effect 重新遍历时不再遇到该 id。
   * 这样 ToastComponent 内的 scheduled 集合才可安全 delete，
   * 避免「已消失的 toast 在新增其他 toast 时被重新加入」的 bug，
   * 同时修复 messages 列表无限累积的内存增长问题。
   */
  remove(id: number): void {
    this.messages.update(list => list.filter(m => m.id !== id));
  }
}
