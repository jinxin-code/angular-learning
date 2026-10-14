# 用户管理后端

基于 NestJS 11、TypeORM 和 SQLite 的用户管理 API，同时提供 SSE 启动通知。

## 安装依赖

```bash
npm install
```

## 本地开发

```bash
npm run start:dev
```

服务默认运行在：<http://localhost:3000>

## 构建和生产启动

```bash
npm run build
npm run start:prod
```

生产启动会设置 `NODE_ENV=production`，默认关闭 TypeORM 自动表结构同步。

## 环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `NODE_ENV` | 未设置 | 为 `production` 时默认关闭 `synchronize` |
| `DB_SYNCHRONIZE` | 跟随环境 | 设置为 `true` 或 `false`，显式控制 TypeORM 表结构同步 |

## API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/users` | 获取用户列表 |
| GET | `/users/:id` | 获取用户详情 |
| POST | `/users` | 创建用户 |
| PATCH | `/users/:id` | 更新用户 |
| DELETE | `/users/:id` | 删除用户 |
| GET | `/events/stream` | SSE 事件流 |

## 测试

```bash
npm test
npm run test:e2e
```
