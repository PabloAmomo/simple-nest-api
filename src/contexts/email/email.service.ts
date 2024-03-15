import { EmailTestResponseDto } from '@core/dtos/email/email-test-response.dto';
import { HealthResponseDto } from '@core/dtos/health/health-response.dto';
import { InvalidDataException } from '@core/exceptions/invalid-data.exception';
import getCheckHealth from '@functions/get-health-response.function';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async send(email: string): Promise<EmailTestResponseDto> {
    const response: EmailTestResponseDto = {
      status: 'ok',
      time: new Date().toISOString(),
    };

    if (
      !email ||
      email === '' ||
      !email.includes('@') ||
      !email.includes('.')
    ) {
      throw new InvalidDataException('invalid email address');
    }

    await this.mailerService
      .sendMail({
        to: email,
        subject: 'Testing MailerModule',
        template: './test',
        context: {
          email,
        },
      })
      .then(() => {
        Logger.log(`Test email send to ${email}`);
      });

    return response;
  }

  checkHealth(): HealthResponseDto {
    return getCheckHealth();
  }
}
