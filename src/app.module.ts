import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { DatabaseModule } from './modules/database/database.module';
import { HealthModule } from './modules/health/health.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { AuthModule } from './modules/auth/auth.module';
import {
  databaseConfig,
  loggingConfig,
  swaggerConfig,
  appConfig,
  jwtConfig,
  createWinstonConfig,
  validateEnvironmentVariables,
  envValidationSchema,
} from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      ignoreEnvFile: false,
      expandVariables: true,
      validationSchema: envValidationSchema,
      validate: validateEnvironmentVariables,
      load: [
        databaseConfig,
        loggingConfig,
        swaggerConfig,
        appConfig,
        jwtConfig,
      ],
    }),
    WinstonModule.forRoot(createWinstonConfig()),
    DatabaseModule,
    HealthModule,
    TasksModule,
    AuthModule,
    // TODO: Add your additional service modules here
    // ExampleModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
