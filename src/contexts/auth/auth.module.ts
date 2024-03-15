import { AuthController } from './auth.controller';
import { AuthListener } from './auth.listener';
import { AuthMapper } from './auth.mapper';
import { AuthRepository } from '@contexts/auth/repositories/auth/auth.repository';
import { AuthRepositoryModule } from '@contexts/auth/repositories/auth/auth-repository.module';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth-strategies/jwt.strategy';
import { LocalIdStrategy } from './auth-strategies/local-id.strategy';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { RolesGuard } from '@core/guards/roles.guard';
import { UserRepository } from '@contexts/user/repositories/user.repository';
import JwtModuleConfig from './configs/jwt-module.config';
import { LocalEmailStrategy } from './auth-strategies/local-email.strategy';
import { JwtRefreshStrategy } from './auth-strategies/jwt-refresh.strategy';
import { AuthTokenBlackListRepositoryModule } from '@contexts/auth/repositories/auth-token-black-list/auth-token-black-list-repository.module';
import { AuthTokenBlackListRepository } from '@contexts/auth/repositories/auth-token-black-list/auth-token-black-list.repository';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync(JwtModuleConfig),
    AuthRepositoryModule,
    AuthTokenBlackListRepositoryModule,
  ],
  providers: [
    AuthService,
    LocalIdStrategy,
    LocalEmailStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    RolesGuard,
    AuthMapper,
    UserRepository,
    AuthRepository,
    AuthTokenBlackListRepository,
    AuthListener,
  ],
  controllers: [AuthController],
  exports: [RolesGuard],
})
export class AuthModule {}
