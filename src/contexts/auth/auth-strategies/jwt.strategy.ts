import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import checkInterfaceProperties from '@functions/check-interface-properties.function';
import {
  AuthJwtTokenDto,
  AuthJwtTokenDtoKeys,
} from '@core/dtos/auth/auth-jwt-token.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  validate(authJwtTokenDto: AuthJwtTokenDto): { id: string } {
    checkInterfaceProperties(
      authJwtTokenDto,
      AuthJwtTokenDtoKeys,
      'AuthJwtTokenDto',
    );

    const { id } = authJwtTokenDto;
    return { id };
  }
}
