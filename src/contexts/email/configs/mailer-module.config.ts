import { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailerAsyncOptions } from '@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface';

const MailerModuleConfig: MailerAsyncOptions = {
  useFactory: async (config: ConfigService) => ({
    transport: {
      host: config.get('MAIL_HOST'),
      secure: false,
      auth: {
        user: config.get('MAIL_USER'),
        pass: config.get('MAIL_PASSWORD'),
      },
    },
    defaults: {
      from: `"No Reply" <${config.get('MAIL_FROM')}>`,
    },
    template: {
      dir: join(__dirname, '..', 'templates'),
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
  }),
  inject: [ConfigService],
};

export default MailerModuleConfig;
