import { ConfigService } from '@nestjs/config';
import { JwtRefreshStrategy } from '../auth-strategies/jwt-refresh.strategy';
import * as MOCK from '@mocks/app-mocks';
import { Test, TestingModule } from '@nestjs/testing';

describe('JwtStrategy', () => {
  let strategyRefresh: JwtRefreshStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtRefreshStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mockSecretKey'),
          },
        },
      ],
    }).compile();

    strategyRefresh = module.get<JwtRefreshStrategy>(JwtRefreshStrategy);
  });

  it('should be defined', () => {
    expect(strategyRefresh).toBeDefined();
  });

  it('should valide user 1', () => {
    const response = strategyRefresh.validate(MOCK.MOCK_authJwtTokenDto);
    expect(response).toHaveProperty('id', MOCK.MOCK_authJwtTokenDto.id);
  });

  it('should return exception', () => {
    try {
      strategyRefresh.validate({} as any);
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toHaveProperty('status', 400);
      expect(error).toHaveProperty('message', 'invalid AuthJwtTokenDto');
    }
  });
});
