import { AuthActivatedEvent } from '@core/events/auth/auth-activated.event';
import { ConfigModule } from '@nestjs/config';
import { DomainEvents } from '@core/events/domain-events';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MailerService } from '@nestjs-modules/mailer';
import * as MOCK from '@mocks/app-mocks';
import { Test, TestingModule } from '@nestjs/testing';
import { UserListener } from '../user.listener';
import { UserMapper } from '../user.mapper';
import { UserRepository } from '@contexts/user/repositories/user.repository';
import { UserRepositoryModule } from '@contexts/user/repositories/user-repository.module';
import { UserService } from '../user.service';
import ConfigModuleConfig from '@core/configs/config-module.config';

const mockEmitter = {
  emit: jest.fn(),
};

describe('UserListener', () => {
  let userListener: UserListener;
  let mailerService: MailerService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot(),
        ConfigModule.forRoot(ConfigModuleConfig),
        ConfigModule,
        UserRepositoryModule,
      ],
      providers: [
        UserListener,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: mockEmitter,
        },
        UserService,
        UserMapper,
        UserRepository,
      ],
    }).compile();

    userListener = module.get<UserListener>(UserListener);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('userListener should be defined', () => {
    expect(userListener).toBeDefined();
  });

  it('mailerService should be defined', () => {
    expect(mailerService).toBeDefined();
  });

  describe('handleAuthActivatedEvent', () => {
    it('should exist and work (Emit event USER_ACTIVATED_EVENT)', async () => {
      const event: AuthActivatedEvent = MOCK.MOCK_authActivatedEvent;
      await userListener.handleAuthActivatedEvent(event);

      expect(mockEmitter.emit).toHaveBeenCalledWith(
        DomainEvents.USER_ACTIVATED_EVENT,
        expect.objectContaining({
          id: MOCK.MOCK_authActivatedEvent.id,
        }),
      );

      expect(true).toBe(true);
    });
  });
});
