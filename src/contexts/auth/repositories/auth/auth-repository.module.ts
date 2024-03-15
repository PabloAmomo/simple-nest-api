import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseAuth } from './auth.database';
import { AuthEntity } from './auth.entity';
import { AuthRepository } from './auth.repository';
import { REPO_DATASOURCE, REPO_DATASOURCE_LOG } from './auth.constants';
import { AuthLogEntity } from './auth-log/auth-log.entity';
import { DatabaseAuthLog } from './auth-log/auth-log.database';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync(DatabaseAuth),
    TypeOrmModule.forFeature([AuthEntity], REPO_DATASOURCE),
    TypeOrmModule.forRootAsync(DatabaseAuthLog),
    TypeOrmModule.forFeature([AuthLogEntity], REPO_DATASOURCE_LOG),
  ],
  providers: [AuthRepository],
  exports: [TypeOrmModule, AuthRepository],
})
export class AuthRepositoryModule {}
