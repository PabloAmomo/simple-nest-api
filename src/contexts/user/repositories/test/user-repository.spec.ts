import { Repository } from 'typeorm';
import { createMock } from '@golevelup/ts-jest';
import { UserRepository } from '../user.repository';
import { UserEntity } from '../user.entity';
import { UserLogEntity } from '../user-log/user-log.entity';

describe('UserRepository', () => {
  let mockRepository: Repository<UserEntity>;
  let userLogRepository: Repository<UserLogEntity>;
  let userRepository: UserRepository;

  beforeAll(() => {
    mockRepository = createMock<Repository<UserEntity>>();
    userRepository = new UserRepository(mockRepository, userLogRepository);
  });

  it('should be defined', () => {
    expect(userRepository).toBeDefined();
  });

  it('should initialize with the injected repository', () => {
    expect(userRepository).toBeInstanceOf(UserRepository);
  });
});
