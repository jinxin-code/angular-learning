# 用户管理

基于 Angular 22、Signals 与 NestJS 11 的全栈学习项目，包含用户增删改查、Toast 通知、SSE 服务状态通知和备用 API 降级。

## 项目结构

```text
angular-learning/
├── src/                    # Angular 前端
│   ├── app/
│   │   ├── models/         # 用户类型定义
│   │   ├── services/       # 用户 API 与 API 源切换服务
│   │   ├── toast/          # 全局 Toast 组件和服务
│   │   ├── user-detail/    # 用户详情
│   │   └── user-list/      # 用户列表、筛选和编辑
│   └── environments/       # 前端运行配置
├── backend/                # NestJS 后端
│   ├── src/
│   │   ├── events/         # SSE 事件接口
│   │   └── users/          # 用户模块、DTO、实体和服务
│   └── database.sqlite     # SQLite 数据库文件（运行后生成/更新）
└── README.md
```

## 技术栈

- 前端：Angular 22、TypeScript、RxJS、Angular Router、Signals
- 后端：NestJS 11、TypeORM、SQLite、class-validator
- 实时通信：Server-Sent Events（SSE）
- 构建：Angular CLI / `@angular/build`

## 快速开始

### 1. 安装依赖

```bash
npm install
cd backend && npm install
```

### 2. 启动后端

```bash
cd backend
npm run start:dev
```

后端默认运行在：<http://localhost:3000>

### 3. 启动前端

回到项目根目录：

```bash
npm start
```

前端默认运行在：<http://localhost:4200>

## 功能特性

### 用户管理

- 用户列表、搜索、用户名排序和邮箱前缀筛选
- 创建、编辑和删除用户
- 查看用户详情
- 加载中、加载失败和重试状态

### Toast 通知

- 支持 success、error、warning、info 四种类型
- 3 秒后自动消失，也可以手动关闭
- 使用 signal 保存全局消息状态
- 自动清理定时器，避免组件销毁后继续执行

### Signal 响应式

- `signal()` 保存用户列表、加载状态、弹窗状态等可写状态
- `computed()` 自动派生筛选后的用户列表
- `input()` 向 Toast 组件传递消息列表
- `effect()` 监听 API 源变化并自动重新加载列表或详情

### API 源自动切换

前端在两个数据源之间切换：

1. 本地 API：`http://localhost:3000/users`
2. 备用 API：`https://jsonplaceholder.typicode.com/users`

工作方式：

- 默认先使用备用 API，因此后端未启动时页面仍可演示
- 后端启动后通过 `/events/stream` 发送启动事件
- SSE 连接保持打开，后端重启或下线时前端可重新切换 API 源
- 浏览器不支持 SSE 时，前端每 60 秒通过 HTTP 健康检查一次
- 列表和详情组件读取 API 源 signal，API 源变化后会自动重新请求数据

> JSONPlaceholder 的写操作是模拟响应，不会真正持久化；需要完整增删改查能力时请启动本地 NestJS 后端。

## 后端接口

| 方法 | 路径 | 说明 | 状态码 |
| --- | --- | --- | --- |
| GET | `/users` | 获取用户列表 | 200 |
| GET | `/users/:id` | 获取单个用户 | 200 / 404 |
| POST | `/users` | 创建用户 | 201 / 400 |
| PATCH | `/users/:id` | 局部更新用户 | 200 / 400 / 404 |
| DELETE | `/users/:id` | 删除用户 | 204 / 404 |
| GET | `/events/stream` | SSE 事件流 | 200 |

非法数字 ID 会返回 400；不存在的用户会返回 404。

## 数据库

后端使用 SQLite 和 TypeORM：

- 数据库文件位于 `backend/database.sqlite`
- 开发环境默认启用 `synchronize` 自动同步表结构
- 生产环境（`NODE_ENV=production`）默认关闭自动同步，应使用数据库迁移
- 也可以通过 `DB_SYNCHRONIZE=true|false` 显式覆盖该行为

## 构建和测试

### 前端

```bash
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

### 后端

```bash
cd backend
npm run build
npm test
npm run test:e2e
```

## 参考资料

- [Angular 文档](https://angular.dev/)
- [Angular Signals](https://angular.dev/guide/signals)
- [NestJS 文档](https://docs.nestjs.com/)
- [TypeORM 文档](https://typeorm.io/)
- [Server-Sent Events（MDN）](https://developer.mozilla.org/zh-CN/docs/Web/API/Server-sent_events)
