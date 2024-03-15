import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '@contexts/user/repositories/user.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '@contexts/user/repositories/user.entity';
import { UserMapper } from '@contexts/user/user.mapper';
import { AuthJwtTokenDto } from '@core/dtos/auth/auth-jwt-token.dto';
import { AuthTokenBlackListRepository } from '@contexts/auth/repositories/auth-token-black-list/auth-token-black-list.repository';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authTokenBlacklistRepository: AuthTokenBlackListRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userMapper: UserMapper,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return next();

    const tokenFound =
      await this.authTokenBlacklistRepository.getEntityByToken(token);
    if (tokenFound) throw new UnauthorizedException('invalid token');

    let authJwtTokenDto: AuthJwtTokenDto;
    try {
      authJwtTokenDto = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      req.user = authJwtTokenDto;
    } catch (error) {
      return next();
    }

    if (!authJwtTokenDto || !authJwtTokenDto.id) return next();

    const user: UserEntity = await this.userRepository.getEntityById(
      authJwtTokenDto.id,
    );
    if (!user) return next();

    const userDto = this.userMapper.userEntityToUserDto(user);
    // TODO: userLogged
    req['userLogged'] = userDto;
    next();
  }
}
