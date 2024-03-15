import { Repository } from 'typeorm';
import { AuthTokenBlackListRepository } from '../repositories/auth-token-black-list/auth-token-black-list.repository';
import { AuthTokenBlackListEntity } from '../repositories/auth-token-black-list/auth-token-black-list.entity';
import { createMock } from '@golevelup/ts-jest';
import { MOCK_authTokenBlackListEntity } from '@mocks/app-mocks';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthTokenBlackListRepositoryModule } from '../repositories/auth-token-black-list/auth-token-black-list-repository.module';
import { ConfigModule } from '@nestjs/config';
import ConfigModuleConfig from '@core/configs/config-module.config';

describe('AuthTokenBlackListRepository', () => {
  let authTokenBlackListMockRepository: Repository<AuthTokenBlackListEntity>;
  let authTokenBlackListRepository: AuthTokenBlackListRepository;

  beforeAll(() => {
    authTokenBlackListMockRepository =
      createMock<Repository<AuthTokenBlackListEntity>>();

    authTokenBlackListRepository = new AuthTokenBlackListRepository(
      authTokenBlackListMockRepository,
    );
  });

  it('authTokenBlackListRepository should be defined', () => {
    expect(authTokenBlackListRepository).toBeDefined();
  });

  it('should initialize with the injected repository', () => {
    expect(authTokenBlackListRepository).toBeInstanceOf(
      AuthTokenBlackListRepository,
    );
  });

  it('should return null for invalid token', async () => {
    expect(
      authTokenBlackListRepository.getEntityByToken(''),
    ).resolves.toBeNull();
  });
});

describe('AuthTokenBlackListRepository (Using Repository Injection)', () => {
  let repository: AuthTokenBlackListRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(ConfigModuleConfig),
        AuthTokenBlackListRepositoryModule,
      ],
      providers: [
        AuthTokenBlackListRepository,
        {
          provide: getRepositoryToken(AuthTokenBlackListEntity),
          useValue: {
            findOne: jest.fn().mockReturnValue(MOCK_authTokenBlackListEntity),
          },
        },
      ],
    }).compile();

    repository = module.get<AuthTokenBlackListRepository>(
      AuthTokenBlackListRepository,
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('getEntityByToken', () => {
    it('should findOne with token', async () => {
      jest
        .spyOn(repository.repository, 'findOne')
        .mockResolvedValueOnce(MOCK_authTokenBlackListEntity);

      const token = MOCK_authTokenBlackListEntity.token;
      const response: AuthTokenBlackListEntity =
        await repository.getEntityByToken(token);

      expect(response).toEqual(MOCK_authTokenBlackListEntity);
    });
  });

  describe('saveEntity', () => {
    it('should save an entity if not found by token', async () => {
      repository.getEntityByToken = jest.fn().mockResolvedValueOnce(null);

      repository.repository.create = jest
        .fn()
        .mockReturnValueOnce(MOCK_authTokenBlackListEntity);
      repository.repository.save = jest.fn().mockResolvedValueOnce(null);

      // Llamar al método bajo prueba
      const authTokenBlackListEntity: AuthTokenBlackListEntity =
        MOCK_authTokenBlackListEntity;
      await repository.saveEntity(authTokenBlackListEntity);

      const token = MOCK_authTokenBlackListEntity.token;
      expect(repository.getEntityByToken).toHaveBeenCalledWith(token);
      expect(repository.repository.create).toHaveBeenCalledWith(
        authTokenBlackListEntity,
      );
      expect(repository.repository.save).toHaveBeenCalledWith(
        authTokenBlackListEntity,
      );
    });

    it('should not save an entity if found by token', async () => {
      const foundEntity: AuthTokenBlackListEntity =
        MOCK_authTokenBlackListEntity;
      repository.getEntityByToken = jest
        .fn()
        .mockResolvedValueOnce(foundEntity);

      repository.repository.create = jest.fn().mockReturnValueOnce(null);
      repository.repository.save = jest.fn().mockResolvedValueOnce(null);

      const authTokenBlackListEntity: AuthTokenBlackListEntity =
        MOCK_authTokenBlackListEntity;
      await repository.saveEntity(authTokenBlackListEntity);

      const token = MOCK_authTokenBlackListEntity.token;
      expect(repository.getEntityByToken).toHaveBeenCalledWith(token);
      expect(repository.repository.create).not.toHaveBeenCalled();
      expect(repository.repository.save).not.toHaveBeenCalled();
    });
  });
});
