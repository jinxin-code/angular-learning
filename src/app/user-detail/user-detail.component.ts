/**
 * UserDetailComponent - 用户详情组件
 *
 * ===== Angular 信号 (Signal) 改造 =====
 *
 * user / loading 改为 signal：
 * - 模板中读取改为 user() / loading()
 * - @if 控制流条件改为 signal 调用
 * - subscribe 回调里用 set() 更新状态
 *
 * ===== Angular 17+ 新特性 =====
 * 1. @if 控制流指令处理多种状态（加载中、存在、不存在）
 * 2. 可选链操作符 (?.) 的使用
 * 3. 路由参数获取
 */
import { Component, OnInit, signal } from '@angular/core';
/** RouterLink 用于声明式路由导航 */
import { RouterLink } from '@angular/router';
/**
 * ActivatedRoute - 路由服务，用于获取当前路由的参数
 */
import { ActivatedRoute } from '@angular/router';

import { User } from '../models/user';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user-detail',
  imports: [RouterLink],

  template: `
    <!--
      ===== @if 多状态处理 =====
      使用多个 @if 处理：加载中、用户存在、用户不存在 三种状态
      读取 signal 需调用：user()、loading()
    -->
    @if (user()) {
      <div class="card">
        @let u = user()!;
        <h2>{{ u.name }} 的详细信息</h2>
        <div class="detail-info">
          <p><span>ID:</span> {{ u.id }}</p>
          <p><span>姓名:</span> {{ u.name }}</p>
          <p><span>用户名:</span> {{ u.username }}</p>
          <p><span>邮箱:</span> {{ u.email }}</p>

          <!--
            @if 检查可选属性是否存在
            只有当 u.phone 有值时才显示
          -->
          @if (u.phone) {
            <p><span>电话:</span> {{ u.phone }}</p>
          }
          @if (u.website) {
            <p><span>网站:</span> {{ u.website }}</p>
          }

          <!-- 嵌套对象：@if 内 u.address 已收窄为非空，可直接访问 -->
          @if (u.address) {
            <div>
              <h3>地址</h3>
              <p><span>街道:</span> {{ u.address.street }}</p>
              <p><span>套房:</span> {{ u.address.suite }}</p>
              <p><span>城市:</span> {{ u.address.city }}</p>
              <p><span>邮编:</span> {{ u.address.zipcode }}</p>
            </div>
          }

          @if (u.company) {
            <div>
              <h3>公司</h3>
              <p><span>公司名称:</span> {{ u.company.name }}</p>
              <p><span>标语:</span> {{ u.company.catchPhrase }}</p>
              <p><span>业务:</span> {{ u.company.bs }}</p>
            </div>
          }
        </div>

        <div style="margin-top: 20px;">
          <!-- routerLink 属性使用字符串直接赋值 -->
          <button class="btn btn-primary" routerLink="/">返回列表</button>
        </div>
      </div>
    }

    <!-- 用户不存在时显示 -->
    @if (!user() && !loading()) {
      <div class="card">
        <p>未找到该用户</p>
        <button class="btn btn-primary" routerLink="/">返回列表</button>
      </div>
    }

    <!-- 加载状态 -->
    @if (loading()) {
      <div class="card">
        <p>加载中...</p>
      </div>
    }
  `
})
export class UserDetailComponent implements OnInit {
  /**
   * 当前用户对象（signal）
   * 读取：user()，模板中也用 user()
   */
  readonly user = signal<User | null>(null);
  /** 加载状态标志（signal） */
  readonly loading = signal(true);

  /**
   * 注入路由服务
   */
  constructor(
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  /**
   * ngOnInit - 组件初始化
   */
  ngOnInit(): void {
    /**
     * snapshot.paramMap.get('id')
     * +id 将字符串转换为数字
     */
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.userService.getUser(+id).subscribe({
        next: (user) => {
          this.user.set(user);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
        }
      });
    } else {
      this.loading.set(false);
    }
  }
}
