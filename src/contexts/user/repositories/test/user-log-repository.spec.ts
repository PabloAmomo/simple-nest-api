import { Repository } from 'typeorm';
import { UserRepository } from '../user.repository';
import { UserLogEntity } from '../user-log/user-log.entity';
import { createMock } from '@golevelup/ts-jest';
import { UserEntity } from '../user.entity';

describe('UserLogRepository', () => {
  let mockRepositoryUser: Repository<UserEntity>;
  let mockRepositoryUserLog: Repository<UserLogEntity>;
  let userLogRepository: UserRepository;

  beforeEach(() => {
    mockRepositoryUser = createMock<Repository<UserEntity>>();
    mockRepositoryUserLog = createMock<Repository<UserLogEntity>>();

    userLogRepository = new UserRepository(
      mockRepositoryUser,
      mockRepositoryUserLog,
    );
  });

  it('should be defined', () => {
    expect(mockRepositoryUser).toBeDefined();
    expect(mockRepositoryUserLog).toBeDefined();
  });

  it('should initialize with the injected repository', () => {
    expect(userLogRepository).toBeInstanceOf(UserRepository);
  });
});
