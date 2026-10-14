import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

/** 创建用户时允许提交的数据。 */
export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
