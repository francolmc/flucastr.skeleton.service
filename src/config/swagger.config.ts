import { registerAs } from '@nestjs/config';
import { DocumentBuilder, SwaggerDocumentOptions } from '@nestjs/swagger';

/**
 * Interfaz para la configuración de Swagger
 */
export interface SwaggerConfig {
  enabled: boolean;
  path: string;
  title: string;
  description: string;
  version: string;
  termsOfService?: string;
  contact?: {
    name?: string;
    url?: string;
    email?: string;
  };
  license?: {
    name: string;
    url?: string;
  };
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  tags?: Array<{
    name: string;
    description?: string;
    externalDocs?: {
      description: string;
      url: string;
    };
  }>;
  security?: {
    jwt?: {
      enabled: boolean;
      description?: string;
    };
    apiKey?: {
      enabled: boolean;
      name?: string;
      location?: 'header' | 'query' | 'cookie';
    };
  };
  ui?: {
    deepLinking?: boolean;
    displayOperationId?: boolean;
    defaultModelsExpandDepth?: number;
    defaultModelExpandDepth?: number;
    defaultModelRendering?: 'example' | 'model';
    displayRequestDuration?: boolean;
    docExpansion?: 'list' | 'full' | 'none';
    filter?: boolean;
    maxDisplayedTags?: number;
    showExtensions?: boolean;
    showCommonExtensions?: boolean;
    tryItOutEnabled?: boolean;
  };
}

/**
 * Configuración de Swagger basada en el ambiente
 */
export default registerAs('swagger', (): SwaggerConfig => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isDevelopment = nodeEnv === 'development';
  const isProduction = nodeEnv === 'production';

  return {
    enabled:
      process.env.SWAGGER_ENABLED !== 'false' && !nodeEnv.includes('test'),
    path: process.env.SWAGGER_PATH || 'api',
    title: process.env.SWAGGER_TITLE || 'Flucastr Lleva - Service API',
    description:
      process.env.SWAGGER_DESCRIPTION ||
      'API del microservicio para la plataforma Flucastr Lleva',
    version:
      process.env.SWAGGER_VERSION || process.env.npm_package_version || '1.0.0',
    termsOfService: process.env.SWAGGER_TERMS_OF_SERVICE,
    contact: {
      name: process.env.SWAGGER_CONTACT_NAME || 'Flucastr Team',
      url: process.env.SWAGGER_CONTACT_URL || 'https://flucastr.com',
      email: process.env.SWAGGER_CONTACT_EMAIL || 'support@flucastr.com',
    },
    license: {
      name: process.env.SWAGGER_LICENSE_NAME || 'MIT',
      url:
        process.env.SWAGGER_LICENSE_URL ||
        'https://opensource.org/licenses/MIT',
    },
    servers: [
      {
        url:
          process.env.SWAGGER_SERVER_URL ||
          `http://localhost:${process.env.PORT || 3001}`,
        description: isDevelopment
          ? 'Development server'
          : isProduction
            ? 'Production server'
            : 'Server',
      },
    ],
    tags: [
      {
        name: 'Health',
        description: 'Health check endpoints',
      },
      {
        name: 'Tasks',
        description: 'Task management operations',
      },
      {
        name: 'Authentication',
        description: 'Authentication and authorization endpoints',
      },
    ],
    security: {
      jwt: {
        enabled: process.env.JWT_ENABLED !== 'false',
        description: 'JWT Bearer token authentication',
      },
      apiKey: {
        enabled: process.env.API_KEY_ENABLED === 'true',
        name: process.env.API_KEY_NAME || 'X-API-Key',
        location:
          (process.env.API_KEY_LOCATION as 'header' | 'query' | 'cookie') ||
          'header',
      },
    },
    ui: {
      deepLinking: process.env.SWAGGER_DEEP_LINKING !== 'false',
      displayOperationId: process.env.SWAGGER_DISPLAY_OPERATION_ID === 'true',
      defaultModelsExpandDepth: parseInt(
        process.env.SWAGGER_DEFAULT_MODELS_EXPAND_DEPTH || '1',
        10,
      ),
      defaultModelExpandDepth: parseInt(
        process.env.SWAGGER_DEFAULT_MODEL_EXPAND_DEPTH || '1',
        10,
      ),
      defaultModelRendering:
        (process.env.SWAGGER_DEFAULT_MODEL_RENDERING as 'example' | 'model') ||
        'example',
      displayRequestDuration:
        process.env.SWAGGER_DISPLAY_REQUEST_DURATION !== 'false',
      docExpansion:
        (process.env.SWAGGER_DOC_EXPANSION as 'list' | 'full' | 'none') ||
        'list',
      filter: process.env.SWAGGER_FILTER !== 'false',
      maxDisplayedTags: parseInt(
        process.env.SWAGGER_MAX_DISPLAYED_TAGS || '-1',
        10,
      ),
      showExtensions: process.env.SWAGGER_SHOW_EXTENSIONS === 'true',
      showCommonExtensions:
        process.env.SWAGGER_SHOW_COMMON_EXTENSIONS === 'true',
      tryItOutEnabled: process.env.SWAGGER_TRY_IT_OUT_ENABLED !== 'false',
    },
  };
});

/**
 * Crea la configuración del DocumentBuilder para Swagger
 */
export const createSwaggerDocumentBuilder = (
  config?: SwaggerConfig,
): DocumentBuilder => {
  const swaggerConfig: SwaggerConfig =
    config ||
    ({
      enabled: true,
      path: 'api',
      title: 'Flucastr Lleva - Service API',
      description: 'API del microservicio para la plataforma Flucastr Lleva',
      version: '1.0.0',
      contact: {
        name: 'Flucastr Team',
        url: 'https://flucastr.com',
        email: 'support@flucastr.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
      servers: [],
      tags: [],
      security: {
        jwt: { enabled: true },
        apiKey: { enabled: false },
      },
      ui: {},
    } as SwaggerConfig);

  const builder = new DocumentBuilder()
    .setTitle(swaggerConfig.title)
    .setDescription(swaggerConfig.description)
    .setVersion(swaggerConfig.version);

  // Contact information
  if (swaggerConfig.contact) {
    builder.setContact(
      swaggerConfig.contact.name || '',
      swaggerConfig.contact.url || '',
      swaggerConfig.contact.email || '',
    );
  }

  // License information
  if (swaggerConfig.license) {
    builder.setLicense(
      swaggerConfig.license.name,
      swaggerConfig.license.url || '',
    );
  }

  // Terms of service
  if (swaggerConfig.termsOfService) {
    builder.setTermsOfService(swaggerConfig.termsOfService);
  }

  // Servers
  if (swaggerConfig.servers && swaggerConfig.servers.length > 0) {
    swaggerConfig.servers.forEach((server) => {
      builder.addServer(server.url, server.description);
    });
  }

  // Tags
  if (swaggerConfig.tags && swaggerConfig.tags.length > 0) {
    swaggerConfig.tags.forEach((tag) => {
      if (tag.externalDocs) {
        builder.addTag(tag.name, tag.description, tag.externalDocs);
      } else {
        builder.addTag(tag.name, tag.description);
      }
    });
  }

  // Security schemes
  if (swaggerConfig.security?.jwt?.enabled) {
    builder.addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description:
          swaggerConfig.security.jwt.description || 'Enter JWT token',
        in: 'header',
      },
      'jwt',
    );
  }

  if (swaggerConfig.security?.apiKey?.enabled) {
    builder.addApiKey(
      {
        type: 'apiKey',
        name: swaggerConfig.security.apiKey.name || 'X-API-Key',
        in: swaggerConfig.security.apiKey.location || 'header',
        description: 'API Key for authentication',
      },
      'apiKey',
    );
  }

  return builder;
};

/**
 * Opciones del documento Swagger
 */
export const createSwaggerDocumentOptions = (): SwaggerDocumentOptions => {
  return {
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      `${controllerKey}_${methodKey}`,
    deepScanRoutes: true,
    ignoreGlobalPrefix: false,
    extraModels: [],
  };
};

/**
 * Configuración de la UI de Swagger
 */
export const createSwaggerUIOptions = (config?: SwaggerConfig) => {
  const uiConfig = config?.ui || {};

  return {
    swaggerOptions: {
      deepLinking: uiConfig.deepLinking ?? true,
      displayOperationId: uiConfig.displayOperationId ?? false,
      defaultModelsExpandDepth: uiConfig.defaultModelsExpandDepth ?? 1,
      defaultModelExpandDepth: uiConfig.defaultModelExpandDepth ?? 1,
      defaultModelRendering: uiConfig.defaultModelRendering ?? 'example',
      displayRequestDuration: uiConfig.displayRequestDuration ?? true,
      docExpansion: uiConfig.docExpansion ?? 'list',
      filter: uiConfig.filter ?? true,
      maxDisplayedTags: uiConfig.maxDisplayedTags ?? -1,
      showExtensions: uiConfig.showExtensions ?? false,
      showCommonExtensions: uiConfig.showCommonExtensions ?? false,
      tryItOutEnabled: uiConfig.tryItOutEnabled ?? true,
    },
    customSiteTitle: config?.title || 'Flucastr Lleva - API Documentation',
    customfavIcon: '/favicon.ico',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
  };
};

/**
 * Utilidades para Swagger
 */
export class SwaggerUtils {
  /**
   * Verifica si Swagger debe estar habilitado
   */
  static isEnabled(config?: SwaggerConfig): boolean {
    if (config) {
      return config.enabled;
    }

    const nodeEnv = process.env.NODE_ENV || 'development';
    return process.env.SWAGGER_ENABLED !== 'false' && !nodeEnv.includes('test');
  }

  /**
   * Obtiene la URL completa de Swagger
   */
  static getSwaggerUrl(baseUrl: string, config?: SwaggerConfig): string {
    const path = config?.path || process.env.SWAGGER_PATH || 'api';
    return `${baseUrl}/${path}`;
  }

  /**
   * Genera metadatos para endpoints
   */
  static createEndpointMetadata(
    summary: string,
    description?: string,
    tags?: string[],
  ) {
    return {
      summary,
      description: description || summary,
      tags: tags || [],
    };
  }

  /**
   * Crea respuesta estándar para documentación
   */
  static createStandardResponses() {
    return {
      200: { description: 'Operación exitosa' },
      201: { description: 'Recurso creado exitosamente' },
      400: { description: 'Solicitud inválida' },
      401: { description: 'No autorizado' },
      403: { description: 'Acceso prohibido' },
      404: { description: 'Recurso no encontrado' },
      422: { description: 'Error de validación' },
      500: { description: 'Error interno del servidor' },
    };
  }
}
