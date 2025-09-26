import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DatabaseService } from '../database/database.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async check() {
    const dbHealth = await this.databaseService.healthCheck();

    // Determine overall service status
    let serviceStatus = 'ok';
    if (dbHealth.status === 'unhealthy') {
      serviceStatus = 'degraded';
    } else if (dbHealth.status === 'not_configured') {
      serviceStatus = 'ok'; // Service can still work without DB in some cases
    }

    return {
      status: serviceStatus,
      timestamp: new Date().toISOString(),
      service: 'Flucastr Lleva - Service',
      version: '1.0.0',
      database: dbHealth,
    };
  }

  @Get('database')
  @ApiOperation({ summary: 'Database health check' })
  @ApiResponse({ status: 200, description: 'Database health status' })
  async databaseHealth() {
    return await this.databaseService.healthCheck();
  }
}
