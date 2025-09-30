import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ValidatedEnvironmentVariables } from '../../../config/env.validation';
import {
  TokenIntrospectResponse,
  ValidatedExternalUser,
} from '../../../shared/interfaces/auth.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly configService: ConfigService<ValidatedEnvironmentVariables>,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Introspect a JWT token using the external auth service
   */
  async introspectToken(token: string): Promise<TokenIntrospectResponse> {
    try {
      const authServiceUrl = this.configService.get('AUTH_SERVICE_URL', {
        infer: true,
      });
      const introspectEndpoint = this.configService.get(
        'AUTH_SERVICE_INTROSPECT_ENDPOINT',
        {
          infer: true,
        },
      );
      const timeout = this.configService.get('AUTH_SERVICE_TIMEOUT', {
        infer: true,
      });

      const url = `${authServiceUrl}${introspectEndpoint}`;

      this.logger.debug(`Introspecting token at: ${url}`);

      const response = await firstValueFrom(
        this.httpService.post<TokenIntrospectResponse>(
          url,
          { token },
          {
            timeout,
            headers: {
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      if (response.data.active) {
        this.logger.debug(
          `Token introspection successful for user: ${response.data.sub}`,
        );
      } else {
        this.logger.warn('Token introspection returned inactive token');
      }

      return response.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Token introspection failed: ${errorMessage}`,
        errorStack,
      );
      return {
        active: false,
        error: `Token introspection failed: ${errorMessage}`,
      };
    }
  }

  /**
   * Convert introspection response to authenticated user
   */
  mapToAuthenticatedUser(
    introspectResponse: TokenIntrospectResponse,
  ): ValidatedExternalUser | null {
    if (!introspectResponse.active || !introspectResponse.sub) {
      return null;
    }

    return {
      id: introspectResponse.sub,
      email: introspectResponse.email || '',
      roles: introspectResponse.roles || [],
      isActive: introspectResponse.isActive ?? true,
      emailVerified: introspectResponse.emailVerified ?? false,
    };
  }

  /**
   * Validate and get authenticated user from token
   */
  async validateToken(token: string): Promise<ValidatedExternalUser | null> {
    const introspectResponse = await this.introspectToken(token);
    return this.mapToAuthenticatedUser(introspectResponse);
  }
}
