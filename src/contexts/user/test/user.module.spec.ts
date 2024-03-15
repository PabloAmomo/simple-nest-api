import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '../user.controller';
import { UserMapper } from '../user.mapper';
import { UserModule } from '../user.module';
import { UserProfileController } from '../profile/user.profile.controller';
import { UserProfileService } from '../profile/user.profile.service';
import { UserRegisterController } from '../register/user.register.controller';
import { UserRegisterService } from '../register/user.register.service';
import { UserRepository } from '@contexts/user/repositories/user.repository';
import { UserRepositoryModule } from '@contexts/user/repositories/user-repository.module';
import { UserService } from '../user.service';
import ConfigModuleConfig from '@core/configs/config-module.config';

describe('UserModule', () => {
  let usersModule: UserModule;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(ConfigModuleConfig),
        EventEmitterModule.forRoot(),
        ConfigModule,
        UserModule,
        UserRepositoryModule,
      ],
      providers: [
        UserService,
        UserProfileService,
        UserRegisterService,
        UserMapper,
        UserRepository,
      ],
      // Becareful with the controllers order of the controllers, it's important to the routes
      // For example, if you put the UserProfileController after the UserController, the route /user/profile will not work
      // beacuse the UserController will catch the request before the UserProfileController
      // (And understand that the request is user/id: instead of user/profile)
      controllers: [
        UserProfileController,
        UserRegisterController,
        UserController,
      ],
    }).compile();

    usersModule = module.get<UserModule>(UserModule);
  });

  it('should be defined', () => {
    expect(usersModule).toBeDefined();
  });

  it('should import TypeOrmModule', async () => {
    const typeOrmModule = module.get(TypeOrmModule);
    expect(typeOrmModule).toBeDefined();
  });

  it('should import ConfigModule', async () => {
    const moduleTemp = module.get(ConfigModule);
    expect(moduleTemp).toBeDefined();
  });

  it('should import UserModule', async () => {
    const moduleTemp = module.get(UserModule);
    expect(moduleTemp).toBeDefined();
  });

  it('should import EventEmitterModule', async () => {
    const moduleTemp = module.get(EventEmitterModule);
    expect(moduleTemp).toBeDefined();
  });
});
