import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthExampleController } from './auth-example.controller';
import { JwtGuard } from '../../shared/guards/jwt.guard';
import { RbacGuard } from '../../shared/guards/rbac.guard';
import { AbacGuard } from '../../shared/guards/abac.guard';
import { JwtConfig, JwtConfigUtils } from '../../config/jwt.config';

type JwtAlgorithm = 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512';

/**
 * Módulo de autenticación
 * Proporciona guards JWT, RBAC y ABAC para proteger endpoints
 */
@Module({
  imports: [
    // Configurar JwtModule con configuración dinámica
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const jwtConfig = configService.get<JwtConfig>('jwt')!;

        return {
          secret: jwtConfig.secret,
          signOptions: {
            algorithm: jwtConfig.algorithm as JwtAlgorithm,
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience,
          },
          verifyOptions: {
            algorithms: [jwtConfig.algorithm as JwtAlgorithm],
            issuer: jwtConfig.issuer,
            audience: jwtConfig.audience,
            ignoreExpiration: jwtConfig.ignoreExpiration,
            clockTolerance: jwtConfig.clockTolerance,
            maxAge: jwtConfig.maxAge,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthExampleController],
  providers: [JwtGuard, RbacGuard, AbacGuard],
  exports: [JwtGuard, RbacGuard, AbacGuard, JwtModule],
})
export class AuthModule {
  constructor(private readonly configService: ConfigService) {
    this.validateJwtConfiguration();
  }

  /**
   * Valida la configuración JWT al inicializar el módulo
   */
  private validateJwtConfiguration(): void {
    const issues = JwtConfigUtils.validateConfig();

    if (issues.length > 0) {
      console.warn('⚠️  JWT Configuration Issues:');
      issues.forEach((issue) => console.warn(`   - ${issue}`));
    }

    if (JwtConfigUtils.isDevelopment()) {
      console.log('🔐 JWT Configuration Report:');
      console.log(JwtConfigUtils.generateConfigReport());
    }
  }
}
