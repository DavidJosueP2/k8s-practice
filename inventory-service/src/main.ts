import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const logger = new Logger('InventoryBootstrap');
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3001;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(port);
  logger.log(`Inventory service listening on port ${port}.`);
}
bootstrap();
