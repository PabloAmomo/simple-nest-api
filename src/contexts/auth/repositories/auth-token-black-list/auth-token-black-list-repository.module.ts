import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseAuthTokenBlackList } from './auth-token-black-list.database';
import { AuthTokenBlackListEntity } from './auth-token-black-list.entity';
import { AuthTokenBlackListRepository } from './auth-token-black-list.repository';
import { REPO_DATASOURCE } from './auth-token-black-list.constants';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync(DatabaseAuthTokenBlackList),
    TypeOrmModule.forFeature([AuthTokenBlackListEntity], REPO_DATASOURCE),
  ],
  providers: [AuthTokenBlackListRepository],
  exports: [TypeOrmModule, AuthTokenBlackListRepository],
})
export class AuthTokenBlackListRepositoryModule {}
