import { Component, OnDestroy, effect, inject, input, signal } from '@angular/core';

import { ToastService } from './toast.service';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

@Component({
  selector: 'app-toast',
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .toast {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      min-width: 280px;
      max-width: 400px;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s ease;
    }

    .toast.show {
      opacity: 1;
      transform: translateX(0);
    }

    .toast-success {
      background-color: #d4edda;
      color: #155724;
      border-left: 4px solid #28a745;
    }

    .toast-error {
      background-color: #f8d7da;
      color: #721c24;
      border-left: 4px solid #dc3545;
    }

    .toast-warning {
      background-color: #fff3cd;
      color: #856404;
      border-left: 4px solid #ffc107;
    }

    .toast-info {
      background-color: #d1ecf1;
      color: #0c5460;
      border-left: 4px solid #17a2b8;
    }

    .toast-icon {
      margin-right: 10px;
      font-weight: bold;
      font-size: 16px;
    }

    .toast-message {
      flex: 1;
      font-size: 14px;
    }

    .toast-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: inherit;
      opacity: 0.7;
      padding: 0;
      margin-left: 10px;
      line-height: 1;
    }

    .toast-close:hover {
      opacity: 1;
    }
  `],
  template: `
    <div class="toast-container" role="status" aria-live="polite">
      @for (toast of toasts(); track toast.id) {
        <div class="toast toast-{{ toast.type }} show">
          <span class="toast-icon" aria-hidden="true">
            @switch (toast.type) {
              @case ('success') {✓}
              @case ('error') {✗}
              @case ('warning') {⚠}
              @default {ℹ}
            }
          </span>
          <span class="toast-message">{{ toast.message }}</span>
          <button
            type="button"
            class="toast-close"
            aria-label="关闭提示"
            (click)="removeToast(toast.id)"
          >×</button>
        </div>
      }
    </div>
  `
})
export class ToastComponent implements OnDestroy {
  readonly messages = input<ToastMessage[]>([]);

  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  /** 已加入视图的消息 ID，避免 effect 重跑时重复入列。 */
  private readonly scheduled = new Set<number>();
  /** 保存自动消失定时器，组件销毁或手动关闭时需要清理。 */
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  private readonly toastService = inject(ToastService);

  constructor() {
    effect(() => {
      for (const message of this.messages()) {
        if (this.scheduled.has(message.id)) {
          continue;
        }

        this.scheduled.add(message.id);
        this._toasts.update(list => [...list, message]);

        const timer = setTimeout(() => this.removeToast(message.id), 3000);
        this.timers.set(message.id, timer);
      }
    });
  }

  ngOnDestroy(): void {
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }

  removeToast(id: number): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }

    this._toasts.update(list => list.filter(toast => toast.id !== id));
    this.toastService.remove(id);
    this.scheduled.delete(id);
  }
}
