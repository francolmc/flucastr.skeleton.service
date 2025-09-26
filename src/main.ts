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
  // Debug: Mostrar variables de entorno relevantes
  console.log('🔍 Environment Variables Debug:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('JWT_ENABLED:', process.env.JWT_ENABLED);
  console.log('SWAGGER_ENABLED:', process.env.SWAGGER_ENABLED);
  console.log('SWAGGER_PATH:', process.env.SWAGGER_PATH);
  console.log(
    'DATABASE_URL:',
    process.env.DATABASE_URL ? '[SET]' : '[NOT SET]',
  );
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
  console.log('🔍 Swagger Debug:');
  console.log('SwaggerUtils.isEnabled():', SwaggerUtils.isEnabled());
  console.log(
    'NODE_ENV includes test:',
    process.env.NODE_ENV?.includes('test'),
  );
  console.log(
    'SWAGGER_ENABLED !== "false":',
    process.env.SWAGGER_ENABLED !== 'false',
  );
  if (SwaggerUtils.isEnabled()) {
    console.log('✅ Swagger is enabled, setting up...');
    try {
      const swaggerBuilder = createSwaggerDocumentBuilder();
      const swaggerConfig = swaggerBuilder.build();
      const swaggerOptions = createSwaggerDocumentOptions();
      const uiOptions = createSwaggerUIOptions();

      console.log('📝 Creating Swagger document...');
      const document = SwaggerModule.createDocument(
        app,
        swaggerConfig,
        swaggerOptions,
      );
      const swaggerPath = process.env.SWAGGER_PATH || 'api';

      console.log(`📝 Setting up Swagger at /${swaggerPath}...`);
      SwaggerModule.setup(swaggerPath, app, document, uiOptions);
      console.log(`✅ Swagger setup complete at /${swaggerPath}`);
    } catch (error) {
      console.error('❌ Error setting up Swagger:', error);
    }
  } else {
    console.log('❌ Swagger is disabled');
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
