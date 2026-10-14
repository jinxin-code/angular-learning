import { Injectable, signal } from '@angular/core';

import { ToastMessage, ToastType } from './toast.component';

/** 全局 Toast 状态服务；组件通过 signal 直接读取消息列表。 */
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private readonly _messages = signal<ToastMessage[]>([]);
  /** 对外只读，所有写入都必须通过本服务的方法完成。 */
  readonly messages = this._messages.asReadonly();

  private idCounter = 0;

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  warning(message: string): void {
    this.show(message, 'warning');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  clear(): void {
    this._messages.set([]);
  }

  /** Toast 自动消失或手动关闭时，从源头删除对应消息。 */
  remove(id: number): void {
    this._messages.update(list => list.filter(message => message.id !== id));
  }

  private show(message: string, type: ToastType): void {
    const toast: ToastMessage = {
      id: ++this.idCounter,
      message,
      type
    };

    this._messages.update(list => [...list, toast]);
  }
}
