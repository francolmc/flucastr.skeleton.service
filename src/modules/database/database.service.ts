import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from 'generated/prisma';
import { DatabaseConfig } from '../../config/database.config';

@Injectable()
export class DatabaseService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(DatabaseService.name);
  private readonly databaseConfig: DatabaseConfig | null;

  constructor(private configService: ConfigService) {
    const databaseConfig = configService.get<DatabaseConfig>('database');

    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });

    this.databaseConfig = databaseConfig || null;
  }

  async onModuleInit() {
    try {
      // Check if DATABASE_URL is configured
      if (!this.databaseConfig?.url) {
        this.logger.warn(
          'DATABASE_URL is not configured. Database connection skipped.',
        );
        return;
      }

      await this.$connect();
      this.logger.log('Successfully connected to the database');

      // Log database connection info if available
      if (this.databaseConfig) {
        this.logger.log('Database configuration loaded successfully');
      }
    } catch (error) {
      this.logger.error('Error connecting to the database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Successfully disconnected from the database');
    } catch (error) {
      this.logger.error('Error disconnecting from the database:', error);
      throw error;
    }
  }

  /**
   * Get database configuration
   */
  getDatabaseConfig(): DatabaseConfig | null {
    return this.databaseConfig;
  }

  /**
   * Health check method for database connectivity
   */
  async healthCheck(): Promise<{
    status: string;
    timestamp: string;
    message?: string;
  }> {
    try {
      if (!this.databaseConfig?.url) {
        return {
          status: 'not_configured',
          timestamp: new Date().toISOString(),
          message: 'DATABASE_URL is not configured',
        };
      }

      await this.$queryRaw`SELECT 1`;
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get database connection info (without sensitive data)
   */
  getConnectionInfo() {
    if (!this.databaseConfig) {
      return null;
    }

    return {
      poolSettings: this.databaseConfig.pool,
      migrationSettings: this.databaseConfig.migration,
      loggingSettings: this.databaseConfig.logging,
    };
  }
}
