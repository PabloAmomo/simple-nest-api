import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailListener } from '../email.listener';
import { Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Test, TestingModule } from '@nestjs/testing';
import { UserActivatedEvent } from '@core/events/user/user-activated.event';
import { UserCreatedEvent } from '@core/events/user/user-created.event';
import { UserRegisteredEvent } from '@core/events/user/user-registered.event';
import * as MOCK from '@mocks/app-mocks';
import ConfigModuleConfig from '@core/configs/config-module.config';

describe('MailListener', () => {
  let mailListener: EmailListener;
  let mailerService: MailerService;
  let configService: ConfigService;
  const mockLogger: jest.Mocked<Partial<Logger>> = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
  } as jest.Mocked<Partial<Logger>>;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(ConfigModuleConfig), ConfigModule],
      providers: [
        EmailListener,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(),
          },
        },
        Logger,
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
    mailListener = module.get<EmailListener>(EmailListener);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(mailListener).toBeDefined();
  });

  describe('handleUserCreatedEvent', () => {
    it('should send welcome email', async () => {
      const event: UserCreatedEvent = MOCK.MOCK_userCreatedEvent;
      await mailListener.handleUserCreatedEvent(event);
      expect(mailerService.sendMail).toHaveBeenCalledWith(
        MOCK.MOCK_welcomeEmail(event.email, event.name),
      );
    });
  });

  describe('handleOnUserRegistered', () => {
    it('should send welcome email', async () => {
      const event: UserRegisteredEvent = MOCK.MOCK_userRegisteredEvent;
      await mailListener.handleUserRegisteredEvent(event);
      expect(mailerService.sendMail).toHaveBeenCalledWith(
        MOCK.MOCK_welcomeEmail(event.email, event.name),
      );
    });
  });

  describe('handleOnUserActivated', () => {
    it('should send welcome email', async () => {
      const event: UserActivatedEvent = MOCK.MOCK_userActivatedEvent;
      await mailListener.handleUserActivatedEvent(event);
      expect(true).toBe(true);
    });
  });

  describe('handleOnUserActivated (Disabled Email)', () => {
    it('should send welcome email', async () => {
      jest.spyOn(configService, 'get').mockReturnValue('false');

      (mailListener as any).logger = mockLogger;

      const event: UserActivatedEvent = MOCK.MOCK_userActivatedEvent;
      const response = await mailListener.handleUserActivatedEvent(event);
      expect(response).toBeUndefined();

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('Email sending is disabled for'),
      );
    });
  });

  describe('sendWelcomeEmail (Disabled Email)', () => {
    it('should send welcome email', async () => {
      jest.spyOn(configService, 'get').mockReturnValue('false');

      (mailListener as any).logger = mockLogger;

      await (mailListener as any).sendWelcomeEmail('email', {});

      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('Email sending is disabled for'),
      );
    });
  });
});
