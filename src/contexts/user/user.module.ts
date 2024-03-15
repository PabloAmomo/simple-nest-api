import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserMapper } from './user.mapper';
import { UserRepository } from '@contexts/user/repositories/user.repository';
import { UserService } from '@contexts/user/user.service';
import { UserProfileController } from './profile/user.profile.controller';
import { UserProfileService } from './profile/user.profile.service';
import { UserRegisterController } from './register/user.register.controller';
import { UserRegisterService } from './register/user.register.service';
import { UserListener } from './user.listener';
import { UserRepositoryModule } from '@contexts/user/repositories/user-repository.module';

@Module({
  imports: [UserRepositoryModule],
  providers: [
    UserService,
    UserProfileService,
    UserRegisterService,
    UserMapper,
    UserRepository,
    UserListener,
  ],
  // Becareful with the controllers order of the controllers, it's important to the routes
  // For example, if you put the UserProfileController after the UserController, the route /user/profile will not work
  // beacuse the UserController will catch the request before the UserProfileController
  // (And understand that the request is user/id: instead of user/profile)
  controllers: [UserProfileController, UserRegisterController, UserController],
})
export class UserModule {}
