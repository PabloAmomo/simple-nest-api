import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserRegisteredEvent } from '@core/events/user/user-registered.event';
import { MailerService } from '@nestjs-modules/mailer';
import { UserCreatedEvent } from '@core/events/user/user-created.event';
import { DomainEvents } from '@core/events/domain-events';
import { ConfigService } from '@nestjs/config';
import { UserActivatedEvent } from '@core/events/user/user-activated.event';

@Injectable()
export class EmailListener {
  private readonly logger = new Logger('MailListener');
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  @OnEvent(DomainEvents.USER_CREATED_EVENT)
  async handleUserCreatedEvent(event: UserCreatedEvent) {
    const { email, name, id, activationToken } = event;
    await this.sendWelcomeEmail(email, { name, id, activationToken });
  }

  @OnEvent(DomainEvents.USER_REGISTERED_EVENT)
  async handleUserRegisteredEvent(event: UserRegisteredEvent) {
    const { email, name, id, activationToken } = event;
    await this.sendWelcomeEmail(email, { name, id, activationToken });
  }

  @OnEvent(DomainEvents.USER_ACTIVATED_EVENT)
  async handleUserActivatedEvent(event: UserActivatedEvent) {
    const { email, name } = event;

    if (this.configService.get('MAIL_SEND_ACTIVATION') === 'false') {
      this.logger.log(
        `Email sending is disabled for ${email} (Activation email)`,
      );
      return;
    }

    const subject = `Activated ${name}`;
    await this.mailerService.sendMail({
      to: email,
      subject,
      template: 'activated',
      context: {
        name,
      },
    });
  }

  private async sendWelcomeEmail(email: string, data: any) {
    if (this.configService.get('MAIL_SEND_WELCOME') === 'false') {
      this.logger.log(`Email sending is disabled for ${email} (Welcome email)`);
      return;
    }

    const apiActivationPath = this.configService.get('API_ACTIVATION_PATH');
    const { id, activationToken } = data;
    const activationUrl = apiActivationPath
      .replace(':id', id)
      .replace(':activationToken', activationToken);

    const subject = `Welcome ${data.name}`;
    await this.mailerService.sendMail({
      to: email,
      subject,
      template: 'welcome',
      context: {
        ...data,
        activationUrl,
      },
    });
  }
}
