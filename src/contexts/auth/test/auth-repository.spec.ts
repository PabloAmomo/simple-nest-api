import { AuthEntity } from '../repositories/auth/auth.entity';
import { AuthRepository } from '../repositories/auth/auth.repository';
import { createMock } from '@golevelup/ts-jest';
import { Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import ConfigModuleConfig from '@core/configs/config-module.config';
import { AuthRepositoryModule } from '../repositories/auth/auth-repository.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MOCK_authEntity } from '@mocks/app-mocks';
import { AuthLogEntity } from '../repositories/auth/auth-log/auth-log.entity';

describe('AuthRepository', () => {
  let authMockRepository: Repository<AuthEntity>;

  let authLogRepository: Repository<AuthLogEntity>;
  let authRepository: AuthRepository;

  beforeAll(() => {
    authMockRepository = createMock<Repository<AuthEntity>>();
    authRepository = new AuthRepository(authMockRepository, authLogRepository);
  });

  it('authRepository should be defined', () => {
    expect(authRepository).toBeDefined();
  });

  it('should initialize with the injected repository', () => {
    expect(authRepository).toBeInstanceOf(AuthRepository);
  });
});

describe('AuthRepository (Using Repository Injection)', () => {
  let repository: AuthRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(ConfigModuleConfig), AuthRepositoryModule],
      providers: [
        AuthRepository,
        {
          provide: getRepositoryToken(AuthEntity),
          useValue: {
            find: jest.fn().mockReturnValue([MOCK_authEntity]),
          },
        },
      ],
    }).compile();

    repository = module.get<AuthRepository>(AuthRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should findOne with token', async () => {
    jest
      .spyOn(repository.repository, 'find')
      .mockResolvedValueOnce([MOCK_authEntity]);

    const response: AuthEntity[] = await repository.getAllEntities();

    expect(response).toEqual([MOCK_authEntity]);
  });
});
