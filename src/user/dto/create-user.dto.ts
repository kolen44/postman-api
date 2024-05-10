import { IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3, { message: 'Пожалуйста , проверьте инициалы' })
  fio: string;

  @IsString()
  @MinLength(3, { message: 'Неверно введен емейл' })
  email: string;

  @IsString()
  @MinLength(7, { message: 'Номер телефона меньше 7 символов!' })
  phone_number: string;

  @IsString()
  @MinLength(5, { message: 'Пароль меньше 5 символов' })
  password: string;
}
