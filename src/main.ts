import { ValidationPipe, NestApplicationOptions } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import * as bodyParser from 'body-parser';

import { AllExceptionsFilter } from '@common/filters/all-exceptions.filter';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const appOptions: NestApplicationOptions = {
      cors: true,
      logger: false,
      abortOnError: false,
    };
    const app = await NestFactory.create(AppModule, appOptions);
    const { httpAdapter } = app.get(HttpAdapterHost);

    app.setGlobalPrefix('api', { exclude: ['/'] });
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

    const logger = app.get(Logger);
    app.useLogger(logger);

    const config = new DocumentBuilder()
      .setTitle('HMIKit HTTP API')
      .setDescription('HMIKit HTTP API document')
      .setVersion('0.1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('/api/docs', app, document);

    const configService = app.get(ConfigService);
    const host = configService.get<string>('http.host');
    const port = configService.get<string>('http.port');

    const jsonLimit = configService.get<string>('http.jsonLimit');
    const bodyLimit = configService.get<string>('http.bodyLimit');
    app.use(bodyParser.json({ limit: jsonLimit }));
    app.use(bodyParser.urlencoded({ limit: bodyLimit, extended: true }));

    logger.log(`Web service listening on ${port}`);
    await app.listen(port, host);
  } catch (error) {
    console.log('Start server failed: ', error);
  }
}

bootstrap();
