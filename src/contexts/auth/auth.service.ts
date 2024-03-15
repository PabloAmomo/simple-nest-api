import { AuthActivatedEvent } from '@core/events/auth/auth-activated.event';
import { AuthEntity } from '@contexts/auth/repositories/auth/auth.entity';
import { AuthLoginResponseDto } from './dtos/auth-login-response.dto';
import { AuthMapper } from './auth.mapper';
import { AuthRepository } from '@contexts/auth/repositories/auth/auth.repository';
import { AuthTokenRefreshResponseDto } from './dtos/auth-token-refresh-response.dto';
import { ConfigService } from '@nestjs/config';
import { DomainEvents } from '@core/events/domain-events';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GeneralException } from '@core/exceptions/general.exception';
import { HealthResponseDto } from '@core/dtos/health/health-response.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { UserDto } from '@contexts/user/dtos/user.dto';
import { UserEntity } from '@contexts/user/repositories/user.entity';
import { UserLoggedDto } from '@core/dtos/user/user-logged.dto';
import { UserNotFoundException } from '@contexts/user/exceptions/user-not-found.exception';
import { UserRepository } from '@contexts/user/repositories/user.repository';
import authValidator from '@contexts/auth/repositories/auth/auth.validator';
import getCheckHealth from '@functions/get-health-response.function';
import createPasswordHash from '@functions/create-hash';
import * as bcrypt from 'bcrypt';
import { AuthTokenBlackListRepository } from '@contexts/auth/repositories/auth-token-black-list/auth-token-black-list.repository';
import { AuthTokenBlackListEntity } from '@contexts/auth/repositories/auth-token-black-list/auth-token-black-list.entity';

@Injectable()
export class AuthService {
  constructor(
    private eventEmitter: EventEmitter2,
    private readonly authRepository: AuthRepository,
    private readonly authTokenBlackListRepository: AuthTokenBlackListRepository,
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
    private jwtService: JwtService,
    private authMapper: AuthMapper,
  ) {}

  checkHealth(): HealthResponseDto {
    return getCheckHealth();
  }

  async disableUser(userLogged: UserLoggedDto, id: string) {
    await this.authRepository.disableEntity(userLogged, id);
  }

  async enableUser(userLogged: UserLoggedDto, id: string) {
    await this.authRepository.enableEntity(userLogged, id);
  }

  async deleteUser(userLogged: UserLoggedDto, id: string) {
    await this.authRepository.deleteEntity(userLogged, id);
  }

  async createUser(userLogged: UserLoggedDto, authEntity: AuthEntity) {
    authEntity.password = await createPasswordHash(authEntity.password);
    await this.authRepository.saveEntity(userLogged, authEntity);
  }

  async changePassword(id: string, password: string): Promise<void> {
    const message = await authValidator({ id, password }, true);
    if (message) throw new GeneralException(message);

    const authEntity: AuthEntity = await this.authRepository.getEntityById(id);
    if (!authEntity) throw new UserNotFoundException();

    const userLogged: UserLoggedDto =
      this.authMapper.authEntityToUserLoggedDto(authEntity);

    const passwordHash = await createPasswordHash(password);

    await this.authRepository.updateEntity(userLogged, id, {
      password: passwordHash,
    });
  }

  async activate(id: string, activationToken: string): Promise<void> {
    const authEntity: AuthEntity = await this.authRepository.getEntityById(id);
    if (!authEntity) throw new UserNotFoundException();

    if (authEntity.activationToken !== activationToken)
      throw new UnauthorizedException('invalid activation token');

    const userLogged: UserLoggedDto =
      this.authMapper.authEntityToUserLoggedDto(authEntity);

    await this.authRepository.updateEntity(userLogged, id, {
      activated: true,
    });

    const authActivatedEvent: AuthActivatedEvent = new AuthActivatedEvent({
      userLogged,
      id,
    });
    this.eventEmitter.emit(
      DomainEvents.AUTH_ACTIVATED_EVENT,
      authActivatedEvent,
    );
  }

  async validateUser(
    findBy: 'email' | 'id',
    value: string,
    password: string,
  ): Promise<UserDto> {
    const userEntity: UserEntity =
      findBy === 'email'
        ? await this.userRepository.getEntityByEmail(value)
        : await this.userRepository.getEntityById(value);

    if (!userEntity) return null;

    const authEntity: AuthEntity = await this.authRepository.getEntityById(
      userEntity.id,
    );

    const isValidPassword = await bcrypt.compare(password, authEntity.password);

    if (!authEntity || !isValidPassword) return null;

    if (authEntity.disabled) throw new UnauthorizedException('user disabled');

    if (!authEntity.activated)
      throw new UnauthorizedException('user not activated');

    const userDto: UserDto = this.authMapper.userEntityToUserDto(userEntity);
    return userDto;
  }

  async tokenRefresh(
    id: string,
    token: string,
  ): Promise<AuthTokenRefreshResponseDto> {
    const user: AuthEntity = await this.authRepository.getEntityById(id);
    if (!user) throw new UserNotFoundException();

    const createAuthTokenBlackListRepository: AuthTokenBlackListEntity =
      this.authTokenBlackListRepository.repository.create({ token });
    await this.authTokenBlackListRepository.saveEntity(
      createAuthTokenBlackListRepository,
    );

    const newToken: string = this.jwtService.sign({
      id,
      timestamp: Date.now(),
    });

    return { token: newToken };
  }

  async logout(token: string, refreshToken: string): Promise<void> {
    const authTokenBlackListEntityToken: AuthTokenBlackListEntity =
      this.authTokenBlackListRepository.repository.create({ token });
    const authTokenBlackListEntityRefreshToken: AuthTokenBlackListEntity =
      this.authTokenBlackListRepository.repository.create({
        token: refreshToken,
      });

    await this.authTokenBlackListRepository.saveEntity(
      authTokenBlackListEntityToken,
    );
    await this.authTokenBlackListRepository.saveEntity(
      authTokenBlackListEntityRefreshToken,
    );
  }

  login(user: UserDto): AuthLoginResponseDto {
    const refreshToken: string = this.getTokenRefresh(user);
    const token: string = this.jwtService.sign({
      id: user.id,
      timestamp: Date.now(),
    });

    return this.authMapper.userDtoAndTokenToAuthResponseDto(
      user.id,
      token,
      refreshToken,
    );
  }

  private getTokenRefresh(user: UserDto): string {
    const jwtSignOptions: JwtSignOptions = {
      secret: this.configService.get<string>('JWT_SECRET_REFRESH', 'secret'),
      expiresIn: this.configService.get<string>(
        'JWT_SECRET_REFRESH_EXPIRES',
        '7d',
      ),
    };
    return this.jwtService.sign(
      { id: user.id, timestamp: Date.now() },
      jwtSignOptions,
    );
  }
}
