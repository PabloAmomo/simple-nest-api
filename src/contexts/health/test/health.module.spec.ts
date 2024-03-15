import { ConfigModule } from '@nestjs/config';
import { HealthController } from '../health.controller';
import { HealthModule } from '../health.module';
import { HealthService } from '../health.service';
import { LoggerModule } from '@contexts/logger/logger.module';
import { Test, TestingModule } from '@nestjs/testing';
import ConfigModuleConfig from '@core/configs/config-module.config';

describe('HealthModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(ConfigModuleConfig),
        ConfigModule,
        HealthModule,
        LoggerModule,
      ],
      controllers: [HealthController],
      providers: [HealthService],
    }).compile();
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should import HealthModule', async () => {
    const typeOrmModule = module.get(HealthModule);
    expect(typeOrmModule).toBeDefined();
  });

  it('should import ConfigModule', async () => {
    const moduleTemp = module.get(ConfigModule);
    expect(moduleTemp).toBeDefined();
  });

  it('should import LoggerModule', async () => {
    const moduleTemp = module.get(LoggerModule);
    expect(moduleTemp).toBeDefined();
  });
});
