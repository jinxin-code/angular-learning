import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/**
 * 用户实体类
 * 使用 TypeORM 装饰器映射到数据库表
 */
@Entity()
export class User {
  /**
   * 用户ID，自动生成
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * 用户真实姓名
   */
  @Column()
  name: string;

  /**
   * 用户名（登录用）
   */
  @Column()
  username: string;

  /**
   * 电子邮件
   */
  @Column()
  email: string;
}
