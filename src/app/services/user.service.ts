/**
 * UserService - 用户服务
 *
 * 服务是Angular中用于组织共享代码的核心概念
 * 使用@Injectable装饰器标记为可注入的服务
 * providedIn: 'root' 表示这是一个单例服务，整个应用共享一个实例
 */
import { Injectable, OnDestroy } from '@angular/core';
/** HttpClient - Angular的HTTP客户端，用于发送HTTP请求 */
import { HttpClient } from '@angular/common/http';
/** Observable - RxJS observables，用于处理异步数据流 */
import { Observable, Subject, interval, takeUntil } from 'rxjs';
/** 引入User模型，获得类型检查支持 */
import { User } from '../models/user';

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
  /** EventSource 实例 */
  private eventSource: EventSource | null = null;
  /** 用于取消订阅的 Subject */
  private destroy$ = new Subject<void>();
  /** SSE 连接是否正在监听 */
  private isSSEConnecting = false;

  /**
   * 依赖注入 HttpClient
   * Angular会自动注入HttpClient实例
   * 这是依赖注入(DI)设计模式的典型应用
   */
  constructor(private http: HttpClient) {
    // 初始化时尝试建立 SSE 连接
    this.setupSSE();
  }

  /**
   * 组件销毁时清理资源
   * 实现 OnDestroy 生命周期钩子
   */
  ngOnDestroy(): void {
    // 发出完成信号，停止所有订阅
    this.destroy$.next();
    this.destroy$.complete();
    // 关闭 SSE 连接
    this.closeSSE();
  }

  /**
   * 建立 SSE 连接
   * 使用 Server-Sent Events 监听后端启动通知
   *
   * SSE 优势：
   * 1. 简单基于 HTTP，无需握手协议
   * 2. 浏览器自动处理重连
   * 3. 单向通信，适合服务端推送场景
   */
  private setupSSE(): void {
    // 防止重复创建连接
    if (this.eventSource || this.isSSEConnecting) {
      return;
    }

    try {
      this.isSSEConnecting = true;
      // 连接到后端 SSE 端点
      // EventSource 是浏览器原生 API，自动处理重连
      this.eventSource = new EventSource(this.sseUrl);

      /**
       * SSE 连接打开时触发
       * 这意味着与后端的连接已建立
       */
      this.eventSource.onopen = () => {
        console.log('SSE 连接已建立');
        this.isSSEConnecting = false;
      };

      /**
       * 收到消息时触发
       * 当后端发送消息时，前端会收到通知
       * 例如：后端启动时发送 "Backend service started"
       */
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

      /**
       * SSE 错误时触发
       * 重要：EventSource 会自动尝试重连，我们不需要手动处理
       * 只有当连接确实无法建立时，才启动定期检测
       */
      this.eventSource.onerror = () => {
        console.log('SSE 连接断开，将自动重连...');
        this.isSSEConnecting = false;
        // 注意：这里没有关闭 EventSource，让浏览器自动重连
        // 如果需要强制停止，可以调用 this.closeSSE()
      };
    } catch (error) {
      console.error('SSE 初始化失败:', error);
      this.isSSEConnecting = false;
      // SSE 初始化失败时，启动定期检测
      this.startPeriodicCheck();
    }
  }

  /**
   * 处理后端启动事件
   * 切换到本地 API
   */
  private handleBackendStarted(): void {
    if (!this.isLocalBackendAvailable) {
      this.isLocalBackendAvailable = true;
      this.currentApiUrl = this.localApiUrl;
      console.log('接收到后端启动通知，切换到本地 API');
      // 后端已启动，不需要 SSE 了，关闭连接节省资源
      this.closeSSE();
    }
  }

  /**
   * 启动定期检测
   * 当 SSE 不可用时作为备用方案
   *
   * 检测逻辑：
   * 1. 每 60 秒检测一次后端状态
   * 2. 如果发现后端可用，切换到本地 API 并重建 SSE 连接
   * 3. 使用 takeUntil 确保可以取消订阅
   */
  private startPeriodicCheck(): void {
    // 如果已经在使用本地 API，不需要检测
    if (this.isLocalBackendAvailable) {
      return;
    }

    console.log('启动定期检测后端状态（每60秒）');

    // 每60秒检测一次后端
    interval(60000)
      .pipe(takeUntil(this.destroy$)) // 组件销毁时自动取消订阅
      .subscribe(() => {
        // 如果已经切换到本地 API，停止检测
        if (this.isLocalBackendAvailable) {
          console.log('后端已可用，停止定期检测');
          return;
        }

        // 检测后端状态
        this.checkBackendStatus();
      });
  }

  /**
   * 检测后端服务状态
   */
  private checkBackendStatus(): void {
    this.http.get(this.localApiUrl, { observe: 'response' }).subscribe({
      next: () => {
        // 后端可用，切换到本地 API
        if (!this.isLocalBackendAvailable) {
          this.handleBackendStarted();
        }
      },
      error: () => {
        // 后端不可用，保持使用备用 API
        if (this.isLocalBackendAvailable) {
          this.isLocalBackendAvailable = false;
          this.currentApiUrl = this.fallbackApiUrl;
          console.log('本地后端服务不可用，切换到备用 API');
        }
      }
    });
  }

  /**
   * 关闭 SSE 连接
   */
  private closeSSE(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  /**
   * 获取当前 API 状态
   * @returns API状态对象，包含是否使用本地API和当前API地址
   */
  getApiStatus(): { isLocal: boolean; apiUrl: string } {
    return {
      isLocal: this.isLocalBackendAvailable,
      apiUrl: this.currentApiUrl
    };
  }

  /**
   * 获取所有用户列表
   * @returns Observable<User[]> - 返回用户数组的可观察对象
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.currentApiUrl);
  }

  /**
   * 获取单个用户详情
   * @param id - 用户ID
   * @returns Observable<User> - 返回单个用户的可观察对象
   */
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.currentApiUrl}/${id}`);
  }

  /**
   * 创建新用户
   * @param user - 用户对象
   * @returns Observable<User> - 返回创建的用户对象
   */
  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.currentApiUrl, user);
  }

  /**
   * 更新现有用户（部分更新）
   * @param user - 用户对象（必须包含id）
   * @returns Observable<User> - 返回更新后的用户对象
   */
  updateUser(user: User): Observable<User> {
    return this.http.patch<User>(`${this.currentApiUrl}/${user.id}`, user);
  }

  /**
   * 删除用户
   * @param id - 要删除的用户ID
   * @returns Observable<any> - 返回删除的用户对象
   */
  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.currentApiUrl}/${id}`);
  }
}
