/**
 * UserService - 用户服务
 *
 * ===== Angular 14+ 新特性 - 服务相关 =====
 *
 * 1. @Injectable({ providedIn: 'root' })
 *    根级别注入，整个应用共享单例
 *
 * 2. 构造函数注入
 *    TypeScript 访问修饰符自动创建类属性
 *
 * ===== Angular 依赖注入 (DI) =====
 *
 * Angular 的依赖注入系统：
 * 1. 提供商 (Provider) - 声明可注入的服务
 * 2. 注入器 (Injector) - 管理依赖解析
 * 3. 令牌 (Token) - 标识依赖
 *
 * providedIn: 'root' 使服务成为应用级单例
 */
import { Injectable, OnDestroy } from '@angular/core';
/**
 * HttpClient - Angular HTTP 客户端
 *
 * 【特点】
 * - 基于 RxJS Observable
 * - 支持泛型类型推断
 * - 自动 JSON 转换
 * - 支持拦截器
 */
import { HttpClient } from '@angular/common/http';
/**
 * Observable, Subject, interval, takeUntil - RxJS
 *
 * 【RxJS 核心概念】
 * - Observable: 可观察对象，生产值流
 * - Subject: 特殊 Observable，可手动发射值
 * - interval: 定时器，创建定时发射的 Observable
 * - takeUntil: 操作符，在某个条件满足时完成 Observable
 */
import { Observable, Subject, interval, takeUntil } from 'rxjs';

import { User } from '../models/user';

/**
 * @Injectable 装饰器
 *
 * 【providedIn 选项】
 * - 'root': 应用级单例（整个应用只有一个实例）
 * - 'platform': 平台级单例
 * - 'any': 每个模块一个实例
 * - undefined: 需要在 NgModule 或 component providers 中声明
 *
 * 【Angular 17+ 变化】
 * 推荐使用函数式 providedIn: 'root'
 * 替代旧的在 NgModule providers 数组中声明
 */
@Injectable({
  providedIn: 'root'
})
export class UserService implements OnDestroy {
  /** 本地后端 API 地址 */
  private localApiUrl = 'http://localhost:3000/users';
  /** SSE 事件流地址 */
  private sseUrl = 'http://localhost:3000/events/stream';
  /** 备用 API 地址（jsonplaceholder） */
  private fallbackApiUrl = 'https://jsonplaceholder.typicode.com/users';
  /** 当前使用的 API 地址 */
  private currentApiUrl: string = this.fallbackApiUrl;
  /** 后端服务是否可用 */
  private isLocalBackendAvailable = false;
  /** EventSource 实例（原生浏览器 API） */
  private eventSource: EventSource | null = null;
  /**
   * Subject 用于取消订阅
   *
   * 【RxJS 内存管理】
   * Subject 是一个可以手动发射值的 Observable
   * 当调用 next() 时，所有订阅者都会收到值
   * 当调用 complete() 时，Observable 完成
   */
  private destroy$ = new Subject<void>();
  /** SSE 连接是否正在监听 */
  private isSSEConnecting = false;
  /** 浏览器是否支持 SSE */
  private isSSESupported: boolean;

  /**
   * 构造函数注入
   *
   * 【方式】
   * constructor(private http: HttpClient) {}
   *
   * TypeScript 的 private 修饰符会自动：
   * 1. 声明类属性 http
   * 2. 注入 HttpClient 实例
   *
   * 【替代方式 - inject 函数】
   * http = inject(HttpClient);
   * Angular 16+ 支持，更灵活
   */
  constructor(private http: HttpClient) {
    this.isSSESupported = this.checkSSESupport();

    if (this.isSSESupported) {
      this.setupSSE();
    } else {
      console.log('当前浏览器不支持 SSE，使用定期检测方案');
      this.startPeriodicCheck();
    }
  }

  /**
   * 检测浏览器是否支持 SSE
   * EventSource 是浏览器原生 API
   */
  private checkSSESupport(): boolean {
    return typeof window !== 'undefined' && typeof window.EventSource !== 'undefined';
  }

  /**
   * ngOnDestroy - 组件销毁生命周期钩子
   *
   * 【作用】
   * 当组件被销毁时自动调用
   * 用于清理资源、取消订阅、关闭连接等
   *
   * 【为什么要清理？】
   * - 防止内存泄漏
   * - 取消未完成的网络请求
   * - 关闭 EventSource 等原生连接
   */
  ngOnDestroy(): void {
    /** 发出完成信号，停止所有使用 destroy$ 的订阅 */
    this.destroy$.next();
    this.destroy$.complete();
    /** 关闭 SSE 连接 */
    this.closeSSE();
  }

  /**
   * 建立 SSE 连接
   *
   * ===== Server-Sent Events (SSE) =====
   *
   * 【概念】
   * SSE 是一种服务器向浏览器推送数据的技术
   * 基于 HTTP 协议，单向通信（服务器 → 浏览器）
   *
   * 【优势】
   * 1. 简单基于 HTTP，无需 WebSocket 握手
   * 2. 浏览器自动处理重连
   * 3. 自动断开连接时自动重连
   * 4. 适合实时性要求不高的场景
   *
   * 【限制】
   * 单向通信（服务器推送到浏览器）
   * 如需双向通信，使用 WebSocket
   */
  private setupSSE(): void {
    if (this.eventSource || this.isSSEConnecting) {
      return;
    }

    try {
      this.isSSEConnecting = true;
      /** 创建 EventSource，连接到 SSE 端点 */
      this.eventSource = new EventSource(this.sseUrl);

      /** 连接打开时触发 */
      this.eventSource.onopen = () => {
        console.log('SSE 连接已建立');
        this.isSSEConnecting = false;
      };

      /** 收到消息时触发 */
      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.message === 'Backend service started') {
            this.handleBackendStarted();
          }
        } catch (error) {
          console.error('SSE 消息解析错误:', error);
        }
      };

      /** 连接错误时触发 */
      this.eventSource.onerror = () => {
        console.log('SSE 连接断开，将自动重连...');
        this.isSSEConnecting = false;
      };
    } catch (error) {
      console.error('SSE 初始化失败:', error);
      this.isSSEConnecting = false;
      this.startPeriodicCheck();
    }
  }

  /** 处理后端启动事件 */
  private handleBackendStarted(): void {
    if (!this.isLocalBackendAvailable) {
      this.isLocalBackendAvailable = true;
      this.currentApiUrl = this.localApiUrl;
      console.log('接收到后端启动通知，切换到本地 API');
      this.closeSSE();
    }
  }

  /**
   * 启动定期检测
   *
   * ===== RxJS 操作符 =====
   *
   * interval(60000) - 创建一个每 60 秒发射一次的 Observable
   *
   * pipe() - 连接多个操作符
   *
   * takeUntil(destroy$) - 在 destroy$ 发射值时完成 Observable
   * 这是 Angular 中处理订阅清理的常用模式
   */
  private startPeriodicCheck(): void {
    if (this.isLocalBackendAvailable) {
      return;
    }

    console.log('启动定期检测后端状态（每60秒）');

    interval(60000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.isLocalBackendAvailable) {
          console.log('后端已可用，停止定期检测');
          return;
        }
        this.checkBackendStatus();
      });
  }

  /** 检测后端服务状态 */
  private checkBackendStatus(): void {
    /**
     * HttpClient.get() 返回 Observable
     * { observe: 'response' } 选项使返回完整的 HTTP 响应对象
     * 默认只返回 body
     */
    this.http.get(this.localApiUrl, { observe: 'response' }).subscribe({
      next: () => {
        if (!this.isLocalBackendAvailable) {
          this.handleBackendStarted();
        }
      },
      error: () => {
        if (this.isLocalBackendAvailable) {
          this.isLocalBackendAvailable = false;
          this.currentApiUrl = this.fallbackApiUrl;
          console.log('本地后端服务不可用，切换到备用 API');
        }
      }
    });
  }

  /** 关闭 SSE 连接 */
  private closeSSE(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  /** 获取当前 API 状态 */
  getApiStatus(): { isLocal: boolean; apiUrl: string } {
    return {
      isLocal: this.isLocalBackendAvailable,
      apiUrl: this.currentApiUrl
    };
  }

  /**
   * 获取所有用户列表
   *
   * 【泛型类型】
   * HttpClient.get<User[]>() 返回 Observable<User[]>
   * TypeScript 会推断类型，提供类型检查支持
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.currentApiUrl);
  }

  /** 获取单个用户详情 */
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.currentApiUrl}/${id}`);
  }

  /**
   * 创建新用户
   *
   * 【Omit 工具类型】
   * Omit<User, 'id'> 表示 User 类型但排除 id 属性
   * 用于创建用户时不需要提供 id（后端自动生成）
   */
  createUser(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(this.currentApiUrl, user);
  }

  /** 更新现有用户（部分更新） */
  updateUser(user: User): Observable<User> {
    return this.http.patch<User>(`${this.currentApiUrl}/${user.id}`, user);
  }

  /** 删除用户 */
  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.currentApiUrl}/${id}`);
  }
}
