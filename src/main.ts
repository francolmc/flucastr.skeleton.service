import { NestFactory } from '@nestjs/core';
import { VersioningType, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import helmet from 'helmet';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import {
  createWinstonConfig,
  createSwaggerDocumentBuilder,
  createSwaggerDocumentOptions,
  createSwaggerUIOptions,
  SwaggerUtils,
  AppConfigUtils,
  EnvValidationUtils,
  SwaggerConfig,
} from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(createWinstonConfig()),
  });

  // Set global prefix
  const globalPrefix = AppConfigUtils.getGlobalPrefix();
  app.setGlobalPrefix(globalPrefix);

  // Enable CORS
  const corsConfig = AppConfigUtils.getCorsConfig();
  if (corsConfig.enabled) {
    app.enableCors(corsConfig);
  }

  // Enable Helmet security headers
  app.use(helmet(AppConfigUtils.getHelmetConfig()));

  // Enable versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Global logging interceptor
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe(AppConfigUtils.getValidationPipeOptions()),
  );

  // Swagger configuration
  if (SwaggerUtils.isEnabled()) {
    // Obtener la configuración de Swagger desde ConfigService
    const configService = app.get(ConfigService);
    const swaggerConfig = configService.get<SwaggerConfig>('swagger');

    const swaggerBuilder = createSwaggerDocumentBuilder(swaggerConfig);
    const swaggerDocument = swaggerBuilder.build();
    const swaggerOptions = createSwaggerDocumentOptions();
    const uiOptions = createSwaggerUIOptions(swaggerConfig);

    const document = SwaggerModule.createDocument(
      app,
      swaggerDocument,
      swaggerOptions,
    );
    const swaggerPath =
      swaggerConfig?.path || process.env.SWAGGER_PATH || 'api';

    SwaggerModule.setup(swaggerPath, app, document, uiOptions);
  }

  const port = AppConfigUtils.getPort();
  await app.listen(port);
  const baseUrl = await app.getUrl();

  const envInfo = AppConfigUtils.getEnvironmentInfo();

  console.log(`🚀 ${envInfo.name} is running on: ${baseUrl}`);
  console.log(`📡 Global prefix: /${globalPrefix}`);

  if (SwaggerUtils.isEnabled()) {
    const swaggerPath = process.env.SWAGGER_PATH || 'api';
    console.log(`📚 Swagger is running on: ${baseUrl}/${swaggerPath}`);
  }

  console.log(`🔧 Environment: ${envInfo.environment}`);
  console.log(`📦 Version: ${envInfo.version}`);

  // Environment validation report (only in development)
  if (AppConfigUtils.isDevelopment()) {
    const missingVars = EnvValidationUtils.checkRequiredVariables();
    if (missingVars.length > 0) {
      console.warn(`⚠️  Missing required variables: ${missingVars.join(', ')}`);
    }
  }

  console.log(`⚡ ${envInfo.name} v${envInfo.version} ready!\n`);
}
bootstrap().catch((err) => {
  console.error('🐛 Error during application bootstrap:', err);
  process.exit(1);
});
