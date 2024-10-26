import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const logger = new Logger('AppBootstrap');
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService>(ConfigService);
  const port = config.get<number>('APP_PORT');

  const options = new DocumentBuilder()
    .setTitle('PW G-31 Bot API')
    .setDescription('### API of the Telegram bot for the Web Programming subject of group 31.')
    .setVersion('1.0')
    .setLicense("MIT License", "https://mit-license.org/")
    .setContact("EduardoProfe666", "https://eduardoprofe666.github.io", "eduardoprofe666@gmail.com")
    .addBearerAuth()
    .build();

  const doc = SwaggerModule.createDocument(app, options);

  const paths = Object.keys(doc.paths).sort();
  const sortedPaths = {};
  paths.forEach(path => {
    sortedPaths[path] = doc.paths[path];
  });
  doc.paths = sortedPaths;

  const schemas = Object.keys(doc.components.schemas).sort();
  const sortedSchemas = {};
  schemas.forEach(schema => {
    sortedSchemas[schema] = doc.components.schemas[schema];
  });
  doc.components.schemas = sortedSchemas;

  SwaggerModule.setup('swagger', app, doc);

  app.enableCors();
  app.enableShutdownHooks();
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    enableDebugMessages: true,
  }));
  app.use(helmet());
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  await app.listen(port);
  logger.log('Listening in port ' + port);

  const address = app.getHttpServer().address();
  const host = address.address === '::' ? 'localhost' : address.address;
  const appUrl = `http://${host}:${address.port}`;
  logger.log(`Swagger is available on: ${appUrl}/swagger`);
}
bootstrap();
