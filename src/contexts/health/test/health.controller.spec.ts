import { ConfigModule } from '@nestjs/config';
import { HealthController } from '../health.controller';
import { HealthService } from '../health.service';
import { LoggerModule } from '@contexts/logger/logger.module';
import { Test, TestingModule } from '@nestjs/testing';
import ConfigModuleConfig from '@core/configs/config-module.config';

describe('HealthController', () => {
  let healthController: HealthController;
  let healthService: HealthService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(ConfigModuleConfig), LoggerModule],
      providers: [
        {
          provide: HealthService,
          useValue: {
            checkHealth: jest.fn(() => 'service response'),
          },
        },
      ],
      controllers: [HealthController],
    }).compile();

    healthService = module.get<HealthService>(HealthService);
    healthController = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(healthController).toBeDefined();
  });

  it('should check health', async () => {
    expect(await healthController.checkHealth()).toBe('service response');
    expect(healthService.checkHealth).toHaveBeenCalled();
  });
});
