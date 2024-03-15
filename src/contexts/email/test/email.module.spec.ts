import { ConfigModule } from '@nestjs/config';
import { EmailModule } from '../email.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { MailerModule } from '@nestjs-modules/mailer';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepositoryModule } from '@contexts/user/repositories/user-repository.module';
import ConfigModuleConfig from '@core/configs/config-module.config';
import MailerModuleConfig from '../configs/mailer-module.config';

describe('EmailModule', () => {
  let mailModule: EmailModule;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(ConfigModuleConfig),
        ConfigModule,
        EventEmitterModule.forRoot(),
        MailerModule.forRootAsync(MailerModuleConfig),
        UserRepositoryModule,
        EmailModule,
      ],
    }).compile();

    mailModule = module.get<EmailModule>(EmailModule);
  });

  it('should be defined', () => {
    expect(mailModule).toBeDefined();
  });

  it('should import TypeOrmModule', async () => {
    const typeOrmModule = module.get(TypeOrmModule);
    expect(typeOrmModule).toBeDefined();
  });

  it('should import ConfigModule', async () => {
    const moduleTemp = module.get(ConfigModule);
    expect(moduleTemp).toBeDefined();
  });

  it('should import MailModule', async () => {
    const moduleTemp = module.get(EmailModule);
    expect(moduleTemp).toBeDefined();
  });

  it('should import MailerModule', async () => {
    const moduleTemp = module.get(MailerModule);
    expect(moduleTemp).toBeDefined();
  });

  it('should import EventEmitterModule', async () => {
    const moduleTemp = module.get(EventEmitterModule);
    expect(moduleTemp).toBeDefined();
  });
});
