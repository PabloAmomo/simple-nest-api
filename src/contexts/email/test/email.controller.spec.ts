import { ConfigModule } from '@nestjs/config';
import { EmailController } from '../email.controller';
import { EmailService } from '../email.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MailerModule } from '@nestjs-modules/mailer';
import { Test, TestingModule } from '@nestjs/testing';
import ConfigModuleConfig from '@core/configs/config-module.config';
import MailerModuleConfig from '../configs/mailer-module.config';
import { InvalidDataException } from '@core/exceptions/invalid-data.exception';

describe('MailController', () => {
  let emailController: EmailController;
  let emailService: EmailService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(ConfigModuleConfig),
        EventEmitterModule.forRoot(),
        ConfigModule,
        MailerModule.forRootAsync(MailerModuleConfig),
      ],
      controllers: [EmailController],
      providers: [
        {
          provide: EmailService,
          useValue: {
            checkHealth: jest.fn(() => 'service response'),
            send: jest.fn().mockResolvedValue('someMailServiceResponse'),
          },
        },
      ],
    }).compile();

    emailService = module.get<EmailService>(EmailService);
    emailController = module.get<EmailController>(EmailController);
  });

  it('should be defined', () => {
    expect(emailController).toBeDefined();
  });

  it('should check health', async () => {
    expect(await emailController.checkHealth()).toBe('service response');
    expect(emailService.checkHealth).toHaveBeenCalled();
  });

  it('should send email', async () => {
    const req = { query: { email: 'test@example.com' } }; // Simula el objeto req con un email en la query
    const result = await emailController.send(req);

    expect(emailService.send).toHaveBeenCalledWith('test@example.com');
    expect(result).toBe('someMailServiceResponse');
  });

  it('should return send email', async () => {
    const req = { query: { email: '' } }; // Simula el objeto req con un email en la query
    try {
      await emailController.send(req);
    } catch (error: any) {
      expect(error).toBeInstanceOf(InvalidDataException);
      expect(error.message).toBe('invalid email');
    }
  });
});
