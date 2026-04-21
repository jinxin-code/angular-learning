/**
 * UserService - 用户服务
 *
 * 服务是Angular中用于组织共享代码的核心概念
 * 使用@Injectable装饰器标记为可注入的服务
 * providedIn: 'root' 表示这是一个单例服务，整个应用共享一个实例
 */
import { Injectable } from '@angular/core';
/** HttpClient - Angular的HTTP客户端，用于发送HTTP请求 */
import { HttpClient } from '@angular/common/http';
/** Observable - RxJS observables，用于处理异步数据流 */
import { Observable, interval } from 'rxjs';
/** 引入User模型，获得类型检查支持 */
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  /** 本地后端 API 地址 */
  private localApiUrl = 'http://localhost:3000/users';
  /** 备用 API 地址（jsonplaceholder） */
  private fallbackApiUrl = 'https://jsonplaceholder.typicode.com/users';
  /** 当前使用的 API 地址 */
  private currentApiUrl: string = this.fallbackApiUrl;
  /** 后端服务是否可用 */
  private isLocalBackendAvailable = false;
  /** WebSocket 连接实例 */
  private socket: WebSocket | null = null;

  /**
   * 依赖注入 HttpClient
   * Angular会自动注入HttpClient实例
   * 这是依赖注入(DI)设计模式的典型应用
   */
  constructor(private http: HttpClient) {
    // 初始化时检测后端服务
    this.checkBackendStatus();
    // 尝试建立 WebSocket 连接
    this.setupWebSocket();
  }

  /**
   * 建立 WebSocket 连接
   * 监听后端启动通知
   */
  private setupWebSocket(): void {
    try {
      // 连接到后端 WebSocket 服务
      this.socket = new WebSocket('ws://localhost:3000');
      
      this.socket.onopen = () => {
        console.log('WebSocket 连接已建立');
      };
      
      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.message === 'Backend service started') {
            this.switchToLocalApi();
          }
        } catch (error) {
          console.error('WebSocket 消息解析错误:', error);
        }
      };
      
      this.socket.onclose = () => {
        console.log('WebSocket 连接已关闭');
        // 连接关闭后，恢复定期检测（30秒一次）
        this.startPeriodicCheck();
      };
      
      this.socket.onerror = (error) => {
        console.error('WebSocket 连接错误:', error);
        // 连接错误后，恢复定期检测（30秒一次）
        this.startPeriodicCheck();
      };
    } catch (error) {
      console.error('WebSocket 初始化失败:', error);
      // 初始化失败后，恢复定期检测（30秒一次）
      this.startPeriodicCheck();
    }
  }

  /**
   * 启动定期检测
   * 当 WebSocket 不可用时作为备用方案
   */
  private startPeriodicCheck(): void {
    // 每30秒检测一次（比之前的10秒更长，减少网络请求）
    interval(30000).subscribe(() => this.checkBackendStatus());
  }

  /**
   * 切换到本地 API
   */
  private switchToLocalApi(): void {
    if (!this.isLocalBackendAvailable) {
      this.isLocalBackendAvailable = true;
      this.currentApiUrl = this.localApiUrl;
      console.log('接收到后端启动通知，切换到本地 API');
    }
  }

  /**
   * 检测后端服务状态
   */
  private checkBackendStatus(): void {
    this.http.get(this.localApiUrl, { observe: 'response' }).subscribe({
      next: () => {
        this.switchToLocalApi();
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
   *
   * 使用泛型 <User[]> 告诉TypeScript返回的是User数组
   * 调用时使用: this.userService.getUsers().subscribe(users => ...)
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.currentApiUrl);
  }

  /**
   * 获取单个用户详情
   * @param id - 用户ID
   * @returns Observable<User> - 返回单个用户的可观察对象
   *
   * 使用模板字符串 ` ${id}` 动态插入用户ID到URL中
   */
  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.currentApiUrl}/${id}`);
  }

  /**
   * 创建新用户
   * @param user - 用户对象
   * @returns Observable<User> - 返回创建的用户对象
   *
   * POST请求用于向服务器提交新数据
   */
  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.currentApiUrl, user);
  }

  /**
   * 更新现有用户（部分更新）
   * @param user - 用户对象（必须包含id）
   * @returns Observable<User> - 返回更新后的用户对象
   *
   * PATCH请求用于部分更新资源，只更新指定的字段
   */
  updateUser(user: User): Observable<User> {
    return this.http.patch<User>(`${this.currentApiUrl}/${user.id}`, user);
  }

  /**
   * 删除用户
   * @param id - 要删除的用户ID
   * @returns Observable<any> - 返回删除的用户对象
   *
   * DELETE请求用于删除资源
   */
  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.currentApiUrl}/${id}`);
  }
}
