import { Injectable, OnDestroy, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, interval, startWith, takeUntil } from 'rxjs';

import { User } from '../models/user';
import { environment } from '../../environments/environment';

type ApiSource = 'local' | 'fallback';

/**
 * 用户 API 服务。
 *
 * 优先使用本地 NestJS API；后端不可用时使用 JSONPlaceholder，便于在后端未启动时演示页面。
 * API 源使用 signal 暴露，组件可在后端上线或下线时自动重新加载数据。
 */
@Injectable({
  providedIn: 'root'
})
export class UserService implements OnDestroy {
  private readonly localUsersUrl = `${environment.localApiBaseUrl}/users`;
  private readonly sseUrl = `${environment.localApiBaseUrl}/events/stream`;

  private readonly _apiSource = signal<ApiSource>('fallback');
  /** 当前启用的 API 源。组件读取该 signal 即可在 API 源变化时自动刷新。 */
  readonly apiSource = this._apiSource.asReadonly();

  private readonly usersApiUrl = computed(() =>
    this._apiSource() === 'local'
      ? this.localUsersUrl
      : environment.fallbackUsersApiUrl
  );

  private eventSource: EventSource | null = null;
  private isSseConnecting = false;
  private isHealthCheckStarted = false;
  private readonly destroy$ = new Subject<void>();

  constructor(private http: HttpClient) {
    if (this.isSseSupported()) {
      this.connectSse();
    } else {
      this.startHealthChecks();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.closeSse();
  }

  /** 获取用户列表。 */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.usersApiUrl());
  }

  /** 按 ID 获取用户详情。 */
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.usersApiUrl()}/${id}`);
  }

  /** 创建用户；id 由本地后端生成。 */
  createUser(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(this.usersApiUrl(), user);
  }

  /** 局部更新用户，避免把路径参数 id 重复放入请求体。 */
  updateUser(user: User): Observable<User> {
    const { id, ...changes } = user;
    return this.http.patch<User>(`${this.usersApiUrl()}/${id}`, changes);
  }

  /** 删除用户；后端成功时返回 204 No Content。 */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.usersApiUrl()}/${id}`);
  }

  private isSseSupported(): boolean {
    return typeof window !== 'undefined' && typeof window.EventSource !== 'undefined';
  }

  /**
   * 建立 SSE 长连接。
   * EventSource 会在网络恢复后自动重连，因此收到启动消息后不能关闭连接，
   * 否则后端再次下线/重启时前端无法收到后续状态。
   */
  private connectSse(): void {
    if (this.eventSource || this.isSseConnecting) {
      return;
    }

    try {
      this.isSseConnecting = true;
      this.eventSource = new EventSource(this.sseUrl);

      this.eventSource.onopen = () => {
        this.isSseConnecting = false;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as { message?: string };
          if (data.message === 'Backend service started') {
            this.useLocalApi();
          }
        } catch (error) {
          console.error('SSE 消息解析失败:', error);
        }
      };

      this.eventSource.onerror = () => {
        this.isSseConnecting = false;
        this.useFallbackApi();
      };
    } catch (error) {
      console.error('SSE 初始化失败，改用定期健康检查:', error);
      this.isSseConnecting = false;
      this.startHealthChecks();
    }
  }

  /**
   * 浏览器不支持 SSE 或 SSE 无法初始化时，用定时 HTTP 检查补偿。
   * 检查会持续运行，以便同时发现后端上线和再次下线。
   */
  private startHealthChecks(): void {
    if (this.isHealthCheckStarted) {
      return;
    }

    this.isHealthCheckStarted = true;
    interval(environment.healthCheckIntervalMs)
      .pipe(startWith(0), takeUntil(this.destroy$))
      .subscribe(() => this.checkBackendStatus());
  }

  private checkBackendStatus(): void {
    this.http.get(this.localUsersUrl, { observe: 'response' })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => this.useLocalApi(),
        error: () => this.useFallbackApi()
      });
  }

  private useLocalApi(): void {
    if (this._apiSource() !== 'local') {
      this._apiSource.set('local');
      console.info('已切换到本地 API');
    }
  }

  private useFallbackApi(): void {
    if (this._apiSource() !== 'fallback') {
      this._apiSource.set('fallback');
      console.info('本地 API 不可用，已切换到备用 API');
    }
  }

  private closeSse(): void {
    this.eventSource?.close();
    this.eventSource = null;
    this.isSseConnecting = false;
  }
}
