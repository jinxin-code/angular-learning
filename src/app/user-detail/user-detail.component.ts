/**
 * UserDetailComponent - 用户详情组件
 *
 * ===== Angular 17+ 新特性 =====
 *
 * 本组件展示了：
 * 1. @if 控制流指令处理多种状态（加载中、存在、不存在）
 * 2. 可选链操作符 (?.) 的使用
 * 3. 路由参数获取
 */
import { Component, OnInit } from '@angular/core';
/** RouterLink 用于声明式路由导航 */
import { RouterLink } from '@angular/router';
/**
 * ActivatedRoute - 路由服务，用于获取当前路由的参数
 * Router - 编程式导航服务
 */
import { ActivatedRoute, Router } from '@angular/router';

import { User } from '../models/user';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [RouterLink],

  template: `
    <!--
      ===== @if 多状态处理 =====
      使用多个 @if 处理：加载中、用户存在、用户不存在 三种状态
    -->
    @if (user) {
      <div class="card">
        <h2>{{ user.name }} 的详细信息</h2>
        <div class="detail-info">
          <p><span>ID:</span> {{ user.id }}</p>
          <p><span>姓名:</span> {{ user.name }}</p>
          <p><span>用户名:</span> {{ user.username }}</p>
          <p><span>邮箱:</span> {{ user.email }}</p>

          <!--
            @if 检查可选属性是否存在
            只有当 user.phone 有值时才显示
          -->
          @if (user.phone) {
            <p><span>电话:</span> {{ user.phone }}</p>
          }
          @if (user.website) {
            <p><span>网站:</span> {{ user.website }}</p>
          }

          <!-- 嵌套对象使用可选链 -->
          @if (user.address) {
            <div>
              <h3>地址</h3>
              <p><span>街道:</span> {{ user.address?.street }}</p>
              <p><span>套房:</span> {{ user.address?.suite }}</p>
              <p><span>城市:</span> {{ user.address?.city }}</p>
              <p><span>邮编:</span> {{ user.address?.zipcode }}</p>
            </div>
          }

          @if (user.company) {
            <div>
              <h3>公司</h3>
              <p><span>公司名称:</span> {{ user.company?.name }}</p>
              <p><span>标语:</span> {{ user.company?.catchPhrase }}</p>
              <p><span>业务:</span> {{ user.company?.bs }}</p>
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
    @if (!user && !loading) {
      <div class="card">
        <p>未找到该用户</p>
        <button class="btn btn-primary" routerLink="/">返回列表</button>
      </div>
    }

    <!-- 加载状态 -->
    @if (loading) {
      <div class="card">
        <p>加载中...</p>
      </div>
    }
  `
})
export class UserDetailComponent implements OnInit {
  /** 当前用户对象 */
  user: User | null = null;
  /** 加载状态标志 */
  loading = true;

  /**
   * 注入路由服务
   *
   * ActivatedRoute 提供当前路由的信息：
   * - paramMap: 路由参数映射
   * - queryParamMap: 查询参数映射
   * - snapshot: 当前时刻的静态快照
   * - url: 路由路径
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  /**
   * ngOnInit - 组件初始化
   */
  ngOnInit(): void {
    /**
     * snapshot.paramMap.get('id')
     * snapshot - 获取当前路由的静态快照
     * paramMap - 路由参数映射
     *
     * +id 将字符串转换为数字
     * 等同于 parseInt(id, 10)
     */
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.userService.getUser(+id).subscribe({
        next: (user) => {
          this.user = user;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }
}
