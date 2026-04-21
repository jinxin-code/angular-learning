import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';

/**
 * 用户控制器
 * 处理与用户相关的 HTTP 请求
 */
@Controller('users')
export class UserController {
  /**
   * 构造函数
   * @param userService 用户服务实例
   */
  constructor(private readonly userService: UserService) {}

  /**
   * 创建新用户
   * @param createUserDto 创建用户的数据
   * @returns 创建的用户对象
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  /**
   * 获取所有用户
   * @returns 用户列表
   */
  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  /**
   * 根据 ID 获取单个用户
   * @param id 用户 ID
   * @returns 用户对象
   */
  @Get(':id')
  findOne(@Param('id') id: string): Promise<User | null> {
    return this.userService.findOne(+id);
  }

  /**
   * 更新用户信息
   * @param id 用户 ID
   * @param updateUserDto 更新用户的数据
   * @returns 更新后的用户对象
   */
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.userService.update(+id, updateUserDto);
  }

  /**
   * 删除用户
   * @param id 用户 ID
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.userService.remove(+id);
  }
}
