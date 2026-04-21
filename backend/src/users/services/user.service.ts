import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';

/**
 * 用户服务
 * 处理与用户相关的业务逻辑
 * 使用 TypeORM Repository 进行数据库操作
 */
@Injectable()
export class UserService {
  /**
   * 构造函数
   * @param userRepository 注入 User 实体的 Repository
   * TypeORM 会自动创建并注入这个 Repository
   */
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * 创建新用户
   * @param createUserDto 创建用户的数据
   * @returns 创建的用户对象
   */
  create(createUserDto: CreateUserDto): Promise<User> {
    // 使用 Repository 的 save 方法创建新用户
    const newUser = this.userRepository.create(createUserDto);
    return this.userRepository.save(newUser);
  }

  /**
   * 获取所有用户
   * @returns 用户列表
   */
  findAll(): Promise<User[]> {
    // 使用 Repository 的 find 方法获取所有用户
    return this.userRepository.find();
  }

  /**
   * 根据 ID 获取单个用户
   * @param id 用户 ID
   * @returns 用户对象，如果不存在则返回 null
   */
  findOne(id: number): Promise<User | null> {
    // 使用 Repository 的 findOne 方法获取单个用户
    return this.userRepository.findOne({ where: { id } });
  }

  /**
   * 更新用户信息
   * @param id 用户 ID
   * @param updateUserDto 更新用户的数据
   * @returns 更新后的用户对象
   * @throws NotFoundException 如果用户不存在
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // 查找用户
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    // 合并更新后的数据
    const updatedUser = this.userRepository.merge(user, updateUserDto);
    // 保存更新
    return this.userRepository.save(updatedUser);
  }

  /**
   * 删除用户
   * @param id 用户 ID
   * @throws NotFoundException 如果用户不存在
   */
  async remove(id: number): Promise<void> {
    // 查找用户
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    // 删除用户
    await this.userRepository.remove(user);
  }
}
