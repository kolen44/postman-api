import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserService } from 'src/user/user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({ usernameField: 'phone_number' });
  }

  async validate(phone_number: string, password: string): Promise<any> {
    const user = await this.userService.validateUser(phone_number, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return { ...user };
  }
}
