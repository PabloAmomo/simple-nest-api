import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from '../health.service';

describe('HealthService', () => {
  let service: HealthService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService],
    }).compile();
    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('verify check', () => {
    expect(service.checkHealth()).toHaveProperty('status', 'ok');
  });
});
