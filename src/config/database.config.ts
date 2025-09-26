import { registerAs } from '@nestjs/config';

export interface DatabaseConfig {
  url: string;
  logging: {
    enableQueryLogging: boolean;
    enableSlowQueryLogging: boolean;
    slowQueryThreshold: number;
    enableMetrics: boolean;
  };
  pool: {
    min: number;
    max: number;
    acquireTimeoutMillis: number;
    createTimeoutMillis: number;
    destroyTimeoutMillis: number;
    idleTimeoutMillis: number;
    reapIntervalMillis: number;
    createRetryIntervalMillis: number;
  };
  migration: {
    autoMigrate: boolean;
    skipSeed: boolean;
  };
}

export default registerAs('database', (): DatabaseConfig => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isDevelopment = nodeEnv === 'development';
  const isProduction = nodeEnv === 'production';

  return {
    url: process.env.DATABASE_URL || '',

    logging: {
      enableQueryLogging: isDevelopment,
      enableSlowQueryLogging: true,
      slowQueryThreshold: isDevelopment ? 1000 : 5000,
      enableMetrics: !nodeEnv.includes('test'),
    },

    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      acquireTimeoutMillis: parseInt(
        process.env.DB_ACQUIRE_TIMEOUT || '60000',
        10,
      ),
      createTimeoutMillis: parseInt(
        process.env.DB_CREATE_TIMEOUT || '30000',
        10,
      ),
      destroyTimeoutMillis: parseInt(
        process.env.DB_DESTROY_TIMEOUT || '5000',
        10,
      ),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '10000', 10),
      reapIntervalMillis: parseInt(process.env.DB_REAP_INTERVAL || '1000', 10),
      createRetryIntervalMillis: parseInt(
        process.env.DB_CREATE_RETRY_INTERVAL || '200',
        10,
      ),
    },

    migration: {
      autoMigrate: process.env.DB_AUTO_MIGRATE === 'true' || isDevelopment,
      skipSeed: process.env.DB_SKIP_SEED === 'true' || isProduction,
    },
  };
});

// Helper functions for database configuration
export const getDatabaseUrl = (): string => {
  return process.env.DATABASE_URL || '';
};

export const isDatabaseConfigValid = (): boolean => {
  const requiredVars = ['DATABASE_URL'];
  return requiredVars.every((varName) => process.env[varName]);
};

export const getDatabaseConnectionInfo = () => {
  const url = getDatabaseUrl();

  if (!url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    return {
      host: parsedUrl.hostname,
      port: parsedUrl.port || '5432',
      database: parsedUrl.pathname.slice(1),
      username: parsedUrl.username,
      ssl: parsedUrl.searchParams.get('sslmode') === 'require',
    };
  } catch {
    return null;
  }
};

// Environment-specific configurations
export const getEnvironmentSpecificConfig = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';

  const configs = {
    development: {
      enableQueryLogging: true,
      enableSlowQueryLogging: true,
      slowQueryThreshold: 1000, // ms
      enableMetrics: true,
    },
    production: {
      enableQueryLogging: false,
      enableSlowQueryLogging: true,
      slowQueryThreshold: 5000, // ms
      enableMetrics: true,
    },
    test: {
      enableQueryLogging: false,
      enableSlowQueryLogging: false,
      slowQueryThreshold: 0,
      enableMetrics: false,
    },
  };

  return configs[nodeEnv as keyof typeof configs] || configs.development;
};
