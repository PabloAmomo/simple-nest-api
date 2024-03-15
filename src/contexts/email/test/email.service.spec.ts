import { AuthGuard } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from '../email.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HealthResponseDto } from '@core/dtos/health/health-response.dto';
import { MailerModule } from '@nestjs-modules/mailer';
import { Test, TestingModule } from '@nestjs/testing';
import ConfigModuleConfig from '@core/configs/config-module.config';
import MailerModuleConfig from '../configs/mailer-module.config';
import { InvalidDataException } from '@core/exceptions/invalid-data.exception';

describe('EmailService', () => {
  let emailService: EmailService;
  let configService: ConfigService;
  let mailUserTest: string = '';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(ConfigModuleConfig),
        EventEmitterModule.forRoot(),
        ConfigModule,
        MailerModule.forRootAsync(MailerModuleConfig),
      ],
      providers: [
        EmailService,
        {
          provide: 'MailerService',
          useValue: { sendMail: jest.fn(() => true) },
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: () => true })
      .overrideGuard(AuthGuard(['local-id', 'local-email']))
      .useValue({ canActivate: () => true })
      .compile();

    emailService = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);

    mailUserTest = configService.get<string>('MAIL_USER_TEST', 'user@mail.com');
  });

  it('should be defined', () => {
    expect(emailService).toBeDefined();
  });

  it('verify send check', async () => {
    try {
      await emailService.send('');
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidDataException);
      expect(error).toHaveProperty('message', 'invalid email address');
    }
  });

  it('verify check', () => {
    expect(emailService.checkHealth()).toHaveProperty('status', 'ok');
  });

  it('should send test email', async () => {
    const response: HealthResponseDto = await emailService.send(mailUserTest);
    expect(response).toHaveProperty('status', 'ok');
  });
});
