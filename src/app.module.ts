import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { DatabaseModule } from './modules/database/database.module';
import { HealthModule } from './modules/health/health.module';
import { TasksModule } from './modules/tasks/tasks.module';
import {
  databaseConfig,
  loggingConfig,
  swaggerConfig,
  appConfig,
  createWinstonConfig,
} from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      ignoreEnvFile: false,
      expandVariables: true,
      load: [databaseConfig, loggingConfig, swaggerConfig, appConfig],
    }),
    WinstonModule.forRoot(createWinstonConfig()),
    DatabaseModule,
    HealthModule,
    TasksModule,
    // TODO: Add your additional service modules here
    // ExampleModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
