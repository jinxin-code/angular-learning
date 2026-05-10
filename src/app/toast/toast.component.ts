/**
 * ToastComponent - 消息提示组件
 *
 * ===== Angular 17+ 新特性 =====
 *
 * 1. @for 控制流指令
 * 2. @if 控制流指令
 * 3. Standalone Component
 * 4. 内联样式 (inline styles)
 *
 * ===== 组件通信 =====
 *
 * 【@Input 装饰器】
 * @Input() messages - 接收从父组件传入的消息列表
 * 父组件通过属性绑定传递数据：[messages]="toastMessages"
 *
 * 【变更检测】
 * OnChanges 生命周期钩子 - 监听 @Input 属性变化
 * 当父组件传入的 messages 数组变化时，自动触发 ngOnChanges
 */
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

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
  standalone: true,

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
        遍历 toasts 数组，渲染每个 Toast 消息
        track 关键字必须指定，使用 id 作为唯一标识
      -->
      @for (toast of toasts; track toast.id) {
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
export class ToastComponent implements OnChanges {
  /**
   * @Input() 装饰器
   *
   * 【作用】
   * 标记属性为输入属性，允许父组件通过属性绑定传递数据
   *
   * 【使用方式】
   * 父组件模板：<app-toast [messages]="toastMessages"></app-toast>
   * 父组件类：toastMessages: ToastMessage[] = []
   *
   * 【类型安全】
   * TypeScript 会检查传入的值是否符合声明的类型
   */
  @Input() messages: ToastMessage[] = [];

  /** Toast 消息列表（本地状态） */
  toasts: ToastMessage[] = [];

  /**
   * ngOnChanges - 生命周期钩子
   *
   * 【触发时机】
   * 当 @Input() 属性变化时自动调用
   *
   * 【SimpleChanges】
   * 包含所有 @Input 属性的变化信息
   * - previousValue: 之前的值
   * - currentValue: 当前的值
   * - firstChange: 是否是首次变化
   */
  ngOnChanges(changes: SimpleChanges) {
    if (changes['messages'] && changes['messages'].currentValue) {
      const newMessages = changes['messages'].currentValue as ToastMessage[];
      newMessages.forEach(msg => {
        /** 检查消息是否已存在 */
        if (!this.toasts.find(t => t.id === msg.id)) {
          this.toasts.push(msg);
          /** 3秒后自动移除 */
          setTimeout(() => this.removeToast(msg.id), 3000);
        }
      });
    }
  }

  /** 移除 Toast 消息 */
  removeToast(id: number) {
    const index = this.toasts.findIndex(t => t.id === id);
    if (index !== -1) {
      this.toasts.splice(index, 1);
    }
  }
}
