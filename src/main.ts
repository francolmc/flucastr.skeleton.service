import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import {
  createWinstonConfig,
  createSwaggerDocumentBuilder,
  createSwaggerDocumentOptions,
  createSwaggerUIOptions,
  SwaggerUtils,
} from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(createWinstonConfig()),
  });

  // Enable versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Swagger configuration
  if (SwaggerUtils.isEnabled()) {
    const swaggerBuilder = createSwaggerDocumentBuilder();
    const swaggerConfig = swaggerBuilder.build();
    const swaggerOptions = createSwaggerDocumentOptions();
    const uiOptions = createSwaggerUIOptions();

    const document = SwaggerModule.createDocument(
      app,
      swaggerConfig,
      swaggerOptions,
    );
    const swaggerPath = process.env.SWAGGER_PATH || 'api';

    SwaggerModule.setup(swaggerPath, app, document, uiOptions);
  }

  await app.listen(process.env.PORT ?? 3001);
  const baseUrl = await app.getUrl();

  console.log(`🚀 Application is running on: ${baseUrl}`);

  if (SwaggerUtils.isEnabled()) {
    const swaggerPath = process.env.SWAGGER_PATH || 'api';
    console.log(`📚 Swagger is running on: ${baseUrl}/${swaggerPath}`);
  }

  console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚡ Flucastr Lleva - Service v1.0 ready!\n`);
}
bootstrap().catch((err) => {
  console.error('🐛 Error during application bootstrap:', err);
  process.exit(1);
});
