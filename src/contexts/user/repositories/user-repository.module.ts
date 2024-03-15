import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseUser } from './user.database';
import { UserEntity } from './user.entity';
import { UserRepository } from './user.repository';
import { REPO_DATASOURCE, REPO_DATASOURCE_LOG } from './user.constants';
import { UserLogEntity } from './user-log/user-log.entity';
import { DatabaseUserLog } from './user-log/user-log.database';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync(DatabaseUser),
    TypeOrmModule.forFeature([UserEntity], REPO_DATASOURCE),
    TypeOrmModule.forRootAsync(DatabaseUserLog),
    TypeOrmModule.forFeature([UserLogEntity], REPO_DATASOURCE_LOG),
  ],
  providers: [UserRepository],
  exports: [TypeOrmModule, UserRepository],
})
export class UserRepositoryModule {}
