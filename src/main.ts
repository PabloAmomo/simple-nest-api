import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(express()),
  );

  const configService = app.get(ConfigService);

  const API_PORT = configService.get<string>('API_PORT', '3000');
  const DOC_AVAILABLE = configService.get<boolean>('DOC_AVAILABLE', false);
  const DEV_MODE = configService.get<boolean>('DEV_MODE', false);
  const DOC_PATH = configService.get<string>('DOC_PATH', `docs`);

  if (DEV_MODE) app.enableCors();

  if (DOC_AVAILABLE) {
    const options = new DocumentBuilder()
      .addBearerAuth()
      .setTitle('Nest-js Swagger API')
      .setDescription('Swagger API description')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup(`/${DOC_PATH}`, app, document);
  }

  await app.listen(API_PORT, '0.0.0.0');

  const logger = app.get(Logger);
  logger.log(`App is ready and listening on port ${API_PORT} 🚀`);
  if (DOC_AVAILABLE)
    logger.log(`Doc path on http://localhost:${API_PORT}/${DOC_PATH} 📒`);
  logger.log(`Health path on http://localhost:${API_PORT}/health 👨‍⚕️`);
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
