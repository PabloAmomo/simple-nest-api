import { Test, TestingModule } from '@nestjs/testing';
import { LocalIdStrategy } from '../auth-strategies/local-id.strategy';
import { AuthService } from '../auth.service';
import { UnauthorizedException } from '@nestjs/common';
import * as MOCK from '@mocks/app-mocks';

describe('LocalStrategy ID', () => {
  let strategy: LocalIdStrategy;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalIdStrategy,
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    strategy = module.get<LocalIdStrategy>(LocalIdStrategy);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user if authentication succeeds', async () => {
      jest
        .spyOn(authService, 'validateUser')
        .mockResolvedValueOnce(MOCK.MOCK_userEntity);

      const result = await strategy.validate(
        null,
        MOCK.MOCK_userEntity.id,
        MOCK.MOCK_password,
      );

      expect(result).toEqual(MOCK.MOCK_userEntity);
    });

    it('should throw UnauthorizedException if authentication fails', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValueOnce(null);

      await expect(
        strategy.validate(null, MOCK.MOCK_userEntity.id, 'invalid'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
