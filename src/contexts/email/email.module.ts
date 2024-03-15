import { EmailController } from './email.controller';
import { EmailListener } from './email.listener';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { UserRepositoryModule } from '@contexts/user/repositories/user-repository.module';
import MailerModuleConfig from './configs/mailer-module.config';

@Module({
  imports: [
    MailerModule.forRootAsync(MailerModuleConfig),
    UserRepositoryModule,
  ],
  providers: [EmailService, EmailListener],
  exports: [EmailService],
  controllers: [EmailController],
})
export class EmailModule {}
