import { Repository } from 'typeorm';
import { createMock } from '@golevelup/ts-jest';
import { AuthEntity } from '../repositories/auth/auth.entity';
import { AuthRepository } from '../repositories/auth/auth.repository';
import { AuthLogEntity } from '../repositories/auth/auth-log/auth-log.entity';

describe('AuthLogRepository', () => {
  let mockRepositoryAuth: Repository<AuthEntity>;
  let mockRepositoryAuthLog: Repository<AuthLogEntity>;
  let authLogRepository: AuthRepository;

  beforeEach(() => {
    mockRepositoryAuth = createMock<Repository<AuthEntity>>();
    mockRepositoryAuthLog = createMock<Repository<AuthLogEntity>>();

    authLogRepository = new AuthRepository(
      mockRepositoryAuth,
      mockRepositoryAuthLog,
    );
  });

  it('should be defined', () => {
    expect(mockRepositoryAuth).toBeDefined();
    expect(mockRepositoryAuthLog).toBeDefined();
  });

  it('should initialize with the injected repository', () => {
    expect(authLogRepository).toBeInstanceOf(AuthRepository);
  });
});
