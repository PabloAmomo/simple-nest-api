import { Controller, Get, HttpCode } from '@nestjs/common';
import { HealthService } from './health.service';
import { Roles } from '@core/decorators/roles.decorator';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiHealthResponseDto } from '@core/dtos/health/health-response.dto';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({
    description: 'health check',
    schema: ApiHealthResponseDto,
  })
  @Roles()
  @Get()
  @HttpCode(200)
  checkHealth() {
    return this.healthService.checkHealth();
  }
}
