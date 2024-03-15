import { AuthController } from '../auth.controller';
import { AuthModule } from '../auth.module';
import { AuthRepository } from '@contexts/auth/repositories/auth/auth.repository';
import { AuthRepositoryModule } from '@contexts/auth/repositories/auth/auth-repository.module';
import { AuthService } from '../auth.service';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from '@contexts/auth/auth-strategies/jwt.strategy';
import { LocalIdStrategy } from '@contexts/auth/auth-strategies/local-id.strategy';
import { PassportModule } from '@nestjs/passport';
import { RolesGuard } from '@core/guards/roles.guard';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '@contexts/user/repositories/user.repository';
import { UserRepositoryModule } from '@contexts/user/repositories/user-repository.module';
import ConfigModuleConfig from '@core/configs/config-module.config';
import JwtModuleConfig from '../configs/jwt-module.config';

describe('AuthModule', () => {
  let authModule: AuthModule;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot(),
        ConfigModule.forRoot(ConfigModuleConfig),
        PassportModule,
        ConfigModule,
        JwtModule.registerAsync(JwtModuleConfig),
        AuthModule,
        AuthRepositoryModule,
        UserRepositoryModule,
      ],
      providers: [UserRepository, AuthRepository],
    }).compile();

    authModule = module.get<AuthModule>(AuthModule);
  });

  it('should be defined', () => {
    expect(authModule).toBeDefined();
  });

  it('should import JwtModule', () => {
    const jwtService = module.get<JwtService>(JwtService);
    expect(jwtService).toBeDefined();
  });

  it('should import TypeOrmModule', async () => {
    const typeOrmModule = module.get(TypeOrmModule);
    expect(typeOrmModule).toBeDefined();
  });

  it('should provide AuthService', () => {
    const authService = module.get<AuthService>(AuthService);
    expect(authService).toBeDefined();
  });

  it('should provide LocalStrategy', () => {
    const localStrategy = module.get<LocalIdStrategy>(LocalIdStrategy);
    expect(localStrategy).toBeDefined();
  });

  it('should provide JwtStrategy', () => {
    const jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    expect(jwtStrategy).toBeDefined();
  });

  it('should provide RolesGuard', () => {
    const rolesGuard = module.get<RolesGuard>(RolesGuard);
    expect(rolesGuard).toBeDefined();
  });

  it('should declare AuthController', () => {
    const authController = module.get<AuthController>(AuthController);
    expect(authController).toBeDefined();
  });
});
