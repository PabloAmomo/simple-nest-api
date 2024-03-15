import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../auth-strategies/jwt.strategy';
import { Test, TestingModule } from '@nestjs/testing';
import * as MOCK from '@mocks/app-mocks';
import { JwtService } from '@nestjs/jwt';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mockSecretKey'),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should valide user 1', () => {
    const response = strategy.validate(MOCK.MOCK_authJwtTokenDto);
    expect(response).toHaveProperty('id', MOCK.MOCK_authJwtTokenDto.id);
  });

  it('should return exception', () => {
    try {
      strategy.validate({} as any);
      expect(true).toBe(false);
    } catch (error) {
      expect(error).toHaveProperty('status', 400);
      expect(error).toHaveProperty('message', 'invalid AuthJwtTokenDto');
    }
  });
});
