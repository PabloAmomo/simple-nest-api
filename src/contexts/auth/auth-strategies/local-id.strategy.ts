import { AuthService } from '@contexts/auth/auth.service';
import { UserDto } from '@contexts/user/dtos/user.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalIdStrategy extends PassportStrategy(Strategy, 'local-id') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'id',
      passwordField: 'password',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, id: string, password: string): Promise<UserDto> {
    const user: UserDto = await this.authService.validateUser(
      'id',
      id,
      password,
    );
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
