/**
 * ToastComponent - 消息提示组件
 *
 * ===== Angular 信号 (Signal) 改造 =====
 *
 * 1. input() - 信号输入，替代 @Input() 装饰器
 *    读取方式：messages()（调用 signal 取值），模板中也可直接 messages()
 *
 * 2. signal() - 组件内部可写状态（toasts）
 *
 * 3. effect() - 副作用函数，当其读取的 signal 变化时自动运行
 *    这里用于「监听 messages 输入变化 → 追加新 toast → 调度自动消失」
 *    【注意】effect 不应用于派生状态（派生用 computed），
 *    但带副作用（定时器、去重历史）的场景适合 effect
 *
 * ===== Standalone Component =====
 * Angular 19+ 起 standalone 默认为 true，可省略 standalone 字段
 */
import { Component, effect, inject, input, signal } from '@angular/core';

import { ToastService } from './toast.service';

/**
 * ToastMessage 接口 - 定义 Toast 消息的结构
 *
 * 【接口说明】
 * 接口用于定义对象的类型结构
 * 当 TypeScript 编译时会进行类型检查
 */
export interface ToastMessage {
  id: number;
  message: string;
  /** type 可以是 'success' | 'error' | 'warning' | 'info' 之一 */
  type: 'success' | 'error' | 'warning' | 'info';
}

@Component({
  selector: 'app-toast',

  /**
   * 内联样式 (inline styles)
   * Angular 17+ 支持直接在组件中编写 styles
   * 也可以使用 stylesUrl 引用外部 .css 文件
   */
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
    <div class="toast-container">
      <!--
        ===== @for 控制流指令 =====
        遍历 toasts signal，渲染每个 Toast 消息
        注意：toasts 是 signal，模板中读取需调用 toasts()
        track 关键字必须指定，使用 id 作为唯一标识
      -->
      @for (toast of toasts(); track toast.id) {
        <div class="toast toast-{{ toast.type }}" [class.show]="true">
          <span class="toast-icon">
            <!--
              ===== @if 嵌套使用 =====
              根据 toast.type 显示不同的图标
            -->
            @if (toast.type === 'success') {✓}
            @else if (toast.type === 'error') {✗}
            @else if (toast.type === 'warning') {⚠}
            @else {ℹ}
          </span>
          <span class="toast-message">{{ toast.message }}</span>
          <button class="toast-close" (click)="removeToast(toast.id)">×</button>
        </div>
      }
    </div>
  `
})
export class ToastComponent {
  /**
   * input() - 信号输入，替代 @Input() 装饰器
   *
   * 【对比 @Input()】
   * - @Input() messages: ToastMessage[] = []
   * - input<T>(initial)   → 返回 InputSignal<T>，读取用 messages()
   *
   * 【优势】
   * - 输入变化可在 computed/effect 中自动追踪
   * - 与 signal 体系一致，无需 ngOnChanges 手动处理
   */
  readonly messages = input<ToastMessage[]>([]);

  /**
   * toasts - 当前显示中的 Toast 列表（signal 持有）
   * asReadonly() 对外暴露只读视图，写入只在本组件内部进行
   */
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  /** 已调度过自动消失的 message id，避免重复入列/重复调度 */
  private scheduled = new Set<number>();

  /**
   * 注入 ToastService —— 仅用于在 toast 被关闭时回写源头（移除该消息）。
   * 读取展示列表仍走 input()（由 AppComponent 传入），保留 input 演示。
   */
  private readonly toastService = inject(ToastService);

  constructor() {
    /**
     * effect() - 副作用函数
     *
     * 【运行时机】
     * 首次运行 + 其内部读取的任意 signal 变化时自动重新运行
     * 这里读取了 this.messages()，故 messages 输入变化即触发
     *
     * 【为什么用 effect 而非 computed】
     * toasts 不是纯派生：需要去重历史 + 启动 setTimeout，
     * 带副作用的「响应」适合 effect；纯派生用 computed
     *
     * 【生命周期】
     * 在注入上下文（构造函数）中创建的 effect 会在组件销毁时自动清理
     */
    effect(() => {
      const incoming = this.messages();
      for (const msg of incoming) {
        if (this.scheduled.has(msg.id)) {
          continue;
        }
        this.scheduled.add(msg.id);
        /** signal.update - 基于前值更新，这里追加新 toast */
        this._toasts.update(list => [...list, msg]);
        /** 3 秒后自动移除 */
        setTimeout(() => this.removeToast(msg.id), 3000);
      }
    });
  }

  /**
   * 移除 Toast 消息
   *
   * 【两步清理，缺一不可】
   * 1. 从 _toasts signal 过滤掉该 toast（视图立即消失）
   * 2. 回写 ToastService.remove(id) 从源头删除该消息，
   *    使后续 effect 重新遍历 messages() 时不再遇到此 id ——
   *    这是 scheduled.delete(id) 能够安全执行的前提
   * 3. 从 scheduled 集合删除该 id，避免集合无限增长（内存泄漏）
   *
   * 若只做第 3 步而不做第 2 步（即报告建议的修复）：
   * 源头列表仍含该 id，下一次新增 toast 触发 effect 重新遍历整表时，
   * 该 id 已不在 scheduled 中 → 被当作新 toast 重新加入并重新计时，
   * 已消失的 toast 会「复活」。
   */
  removeToast(id: number) {
    this._toasts.update(list => list.filter(t => t.id !== id));
    this.toastService.remove(id);
    this.scheduled.delete(id);
  }
}
