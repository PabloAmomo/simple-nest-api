import { HealthResponseDto } from '@core/dtos/health/health-response.dto';

const getCheckHealth = (): HealthResponseDto => {
  const healthCheckResults: HealthResponseDto = {
    status: 'ok',
    time: new Date().toISOString(),
  };
  return healthCheckResults;
};

export default getCheckHealth;
