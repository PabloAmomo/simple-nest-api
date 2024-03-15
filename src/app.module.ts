import { AuthModule } from '@contexts/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { HealthModule } from '@contexts/health/health.module';
import { LoggerModule } from '@contexts/logger/logger.module';
import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { UserModule } from '@contexts/user/user.module';
import { EmailModule } from '@contexts/email/email.module';
import { AuthMiddleware } from '@core/middlewares/auth.middleware';
import { JwtService } from '@nestjs/jwt';
import { UserMapper } from '@contexts/user/user.mapper';
import ConfigModuleConfig from '@core/configs/config-module.config';

@Module({
  imports: [
    ConfigModule.forRoot(ConfigModuleConfig),
    EventEmitterModule.forRoot(),
    AuthModule,
    EmailModule,
    HealthModule,
    UserModule,
    LoggerModule,
  ],
  controllers: [],
  providers: [JwtService, UserMapper],
  exports: [ConfigModule],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
