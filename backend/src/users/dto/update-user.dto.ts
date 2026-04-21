import { IsString, IsEmail, IsOptional } from 'class-validator';

/**
 * 更新用户的 DTO（数据传输对象）
 * 用于验证和传输更新用户时的数据
 */
export class UpdateUserDto {
  /**
   * 用户真实姓名
   * @IsOptional() 字段是可选的
   * @IsString() 确保字段为字符串类型
   */
  @IsOptional()
  @IsString()
  name?: string;

  /**
   * 用户名（登录用）
   * @IsOptional() 字段是可选的
   * @IsString() 确保字段为字符串类型
   */
  @IsOptional()
  @IsString()
  username?: string;

  /**
   * 电子邮件
   * @IsOptional() 字段是可选的
   * @IsEmail() 确保字段为有效的电子邮件格式
   */
  @IsOptional()
  @IsEmail()
  email?: string;
}
