import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { DatabaseModule } from './modules/database/database.module';
import { HealthModule } from './modules/health/health.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { databaseConfig, loggingConfig, createWinstonConfig } from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig, loggingConfig],
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
