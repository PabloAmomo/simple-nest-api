import { AuthListener } from '../auth.listener';
import { AuthMapper } from '../auth.mapper';
import { AuthRepository } from '@contexts/auth/repositories/auth/auth.repository';
import { AuthRepositoryModule } from '@contexts/auth/repositories/auth/auth-repository.module';
import { AuthService } from '../auth.service';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../auth-strategies/jwt.strategy';
import { LocalIdStrategy } from '../auth-strategies/local-id.strategy';
import { MailerService } from '@nestjs-modules/mailer';
import { Test, TestingModule } from '@nestjs/testing';
import { UserAddedEvent } from '@core/events/user/user-added.event';
import { UserDeletedEvent } from '@core/events/user/user-deleted.event';
import { UserDisabledEvent } from '@core/events/user/user-disabled.event';
import { UserEnabledEvent } from '@core/events/user/user-enabled.event';
import { UserRepository } from '@contexts/user/repositories/user.repository';
import { UserRepositoryModule } from '@contexts/user/repositories/user-repository.module';
import * as MOCK from '@mocks/app-mocks';
import ConfigModuleConfig from '@core/configs/config-module.config';
import generateRandomToken from '@functions/generate-random-token.function';
import JwtModuleConfig from '../configs/jwt-module.config';
import { AuthTokenBlackListRepositoryModule } from '@contexts/auth/repositories/auth-token-black-list/auth-token-black-list-repository.module';
import { AuthTokenBlackListRepository } from '@contexts/auth/repositories/auth-token-black-list/auth-token-black-list.repository';

describe('UserListener', () => {
  let authListener: AuthListener;
  let mailerService: MailerService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.registerAsync(JwtModuleConfig),
        UserRepositoryModule,
        AuthRepositoryModule,
        AuthTokenBlackListRepositoryModule,
        EventEmitterModule.forRoot(),
        ConfigModule.forRoot(ConfigModuleConfig),
        ConfigModule,
      ],
      providers: [
        AuthListener,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        AuthService,
        AuthMapper,
        UserRepository,
        AuthRepository,
        AuthTokenBlackListRepository,
        JwtStrategy,
        LocalIdStrategy,
      ],
    }).compile();

    authListener = module.get<AuthListener>(AuthListener);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('userListener should be defined', () => {
    expect(authListener).toBeDefined();
  });

  it('mailerService should be defined', () => {
    expect(mailerService).toBeDefined();
  });

  describe('handleUserAddedEvent', () => {
    it('should exist and work', async () => {
      const event: UserAddedEvent = MOCK.MOCK_userAddedEvent;
      event.id = 'test-handler-added-event';
      event.activationToken = generateRandomToken(event.id);
      await authListener.handleUserAddedEvent(event);
      expect(true).toBe(true);
    });
  });

  describe('handleUserDeletedEvent', () => {
    it('should exist and work', async () => {
      const event: UserDeletedEvent = MOCK.MOCK_userDeletedEvent;
      event.id = 'test-handler-added-event';
      await authListener.handleUserDeletedEvent(event);
      expect(true).toBe(true);
    });
  });

  describe('handleUserDisabledEvent', () => {
    it('should exist and work', async () => {
      const event: UserDisabledEvent = MOCK.MOCK_userDisabledEvent;
      await authListener.handleUserDisabledEvent(event);
      expect(true).toBe(true);
    });
  });

  describe('handleUserEnabledEvent', () => {
    it('should exist and work', async () => {
      const event: UserEnabledEvent = MOCK.MOCK_userEnabledEvent;
      await authListener.handleUserEnabledEvent(event);
      expect(true).toBe(true);
    });
  });
});
