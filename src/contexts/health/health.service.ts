import { Injectable, Logger } from '@nestjs/common';
import { HealthResponseDto } from '@core/dtos/health/health-response.dto';
import getCheckHealth from '@functions/get-health-response.function';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  checkHealth(): HealthResponseDto {
    return getCheckHealth();
  }
}
