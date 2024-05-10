import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Cache } from 'cache-manager';
import { ILike, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    @Inject('CACHE_MANAGER') private cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existUser = await this.userRepository.findOne({
      where: {
        phone_number: createUserDto.phone_number,
      },
    });
    if (existUser)
      throw new BadRequestException(
        'Данный пользователь с таким номером телефона уже существует!',
      );

    const token = this.jwtService.sign({
      phone_number: createUserDto.phone_number,
    });
    const userData = {
      phone_number: createUserDto.phone_number,
      fio: createUserDto.fio,
      email: createUserDto.email,
      password: await argon2.hash(createUserDto.password),
    };

    try {
      const message = encodeURIComponent(`Ваш пароль: ${password}`);

      const url = `https://sms.ru/sms/send?api_id=8AF6EC7A-53C3-80C0-E90B-CA7787E31DC8&to=${createUserDto.phone_number}&msg=hello+world&json=1`;
    } catch (error) {}
    await this.cacheManager.set(`${token}`, userData);

    return { ...userData, token };
  }

  async findOne(phone_number: string) {
    return await this.userRepository.findOne({
      where: { phone_number: ILike(`%${phone_number}%`) },
    });
  }

  async validateUser(phone_number: string, password: string) {
    const user = await this.findOne(phone_number);
    if (!user)
      throw new UnauthorizedException('Данного пользователя не существует');
    const userPassword = user.password;
    const passwordIsMatch = await argon2.verify(userPassword, password);
    console.log(passwordIsMatch, userPassword);
    if (user && passwordIsMatch) {
      return user;
    }
    throw new UnauthorizedException('Имя телефона или пароль неверны');
  }

  async phoneProve(token: string) {
    const cachedData: any = await this.cacheManager.get(`${token}`);
    console.log(cachedData);

    if (cachedData) {
      const user = await this.userRepository.save({
        phone_number: cachedData.phone_number,
        password: cachedData.password,
        fio: cachedData.fio,
        email: cachedData.email,
      });

      return { user, token };
    } else {
      throw new BadRequestException(
        'Время регистрации по номеру телефона истекло',
      );
    }
  }

  generatePassword(): string {
    const length = 8;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }
}
