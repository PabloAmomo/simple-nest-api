import { AuthService } from '@contexts/auth/auth.service';
import { UserDto } from '@contexts/user/dtos/user.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalEmailStrategy extends PassportStrategy(
  Strategy,
  'local-email',
) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    email: string,
    password: string,
  ): Promise<UserDto> {
    const user: UserDto = await this.authService.validateUser(
      'email',
      email,
      password,
    );
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
