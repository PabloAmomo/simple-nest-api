import { HttpException } from '@nestjs/common';
import { InvalidTokenException } from '../exceptions/invalid-token.exception';
import { Role } from '@core/enums/role.enum';
import { UserAddedEventDto } from '@core/dtos/user/user-added-event.dto';
import { UserCreatedEventDto } from '@core/dtos/user/user-created-event.dto';
import { UserCreationDto } from '../dtos/user-creation.dto';
import { UserDeletedEventDto } from '@core/dtos/user/user-deleted-event.dto';
import { UserDisabledEventDto } from '@core/dtos/user/user-disabled-event.dto';
import { UserDto } from '../dtos/user.dto';
import { UserEnabledEventDto } from '@core/dtos/user/user-enabled-event.dto';
import { UserEntity } from '@contexts/user/repositories/user.entity';
import { UserMapper } from '../user.mapper';
import { UserProfileDto } from '../dtos/user-profile.dto';
import { UserRegisterDto } from '../dtos/user-register.dto';
import { UserRegisteredEventDto } from '@core/dtos/user/user-registered-event.dto';
import * as MOCK from '@mocks/app-mocks';

describe('UserMapper', () => {
  const userMapper: UserMapper = new UserMapper();

  describe('UserEntityUpdateFromUserDto', () => {
    it('should update UserEntity from UserDto', async () => {
      const userEntity: UserEntity = MOCK.MOCK_userEntity;
      const userDto: UserDto = MOCK.MOCK_userDto;
      const updatedUserEntity = await userMapper.UserEntityUpdateFromUserDto(
        userEntity,
        userDto,
      );
      expect(updatedUserEntity).toEqual({
        ...userEntity,
        ...userDto,
      });
    });

    it('should throw HttpException if user validation fails', async () => {
      const userEntity: UserEntity = MOCK.MOCK_userEntity;
      // Prepare invalid user
      const userDto: UserDto = {
        ...MOCK.MOCK_userDto,
        email: 'invalid_email', // Invalid email
      };

      // Test validation error
      await expect(
        userMapper.UserEntityUpdateFromUserDto(userEntity, userDto),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('reqUserToUserDto', () => {
    it('should return an exception for invalid token', async () => {
      try {
        await userMapper.userCreationDtoToUserAddedEventDto(
          MOCK.MOCK_userLoggedDto,
          MOCK.MOCK_userCreationDto,
          '',
        );
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBeInstanceOf(InvalidTokenException);
        expect(error.message).toEqual('invalid token');
      }
    });

    it('should return an exception if the validation for userCreationDtoToUserAddedEventDto fails', async () => {
      try {
        await userMapper.userCreationDtoToUserAddedEventDto(
          MOCK.MOCK_userLoggedDto,
          MOCK.MOCK_userCreationDto,
          MOCK.MOCK_activationToken,
        );
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toEqual(
          'password must be longer than or equal to 8 characters',
        );
      }
    });

    it('should convert reqUser to UserDto', () => {
      const reqUser = MOCK.MOCK_userReqUserDto;

      const userDto = userMapper.reqUserToUserDto(reqUser);

      expect(userDto.id).toEqual(reqUser.id);
      expect(userDto.name).toEqual(reqUser.name);
      expect(userDto.email).toEqual(reqUser.email);
      expect(userDto.last).toEqual(reqUser.last);
      expect(userDto.roles).toEqual(reqUser.roles);
    });

    it('should convert userDto To UserActivatedEventDto', () => {
      const userDto: UserDto = MOCK.MOCK_userDto;

      const userActivatedEventDto = userMapper.userDtoToUserActivatedEventDto(
        MOCK.MOCK_userLoggedDto,
        userDto,
      );

      expect(userActivatedEventDto.id).toEqual(userDto.id);
      expect(userActivatedEventDto.name).toEqual(userDto.name);
      expect(userActivatedEventDto.email).toEqual(userDto.email);
      expect(userActivatedEventDto.last).toEqual(userDto.last);
      expect(userActivatedEventDto.roles).toEqual(userDto.roles);
    });

    it('should convert UserEntity to UserActivatedEventDto', () => {
      const userEntity = MOCK.MOCK_userEntity;

      const userActivatedEventDto =
        userMapper.userEntityToUserActivatedEventDto(
          MOCK.MOCK_userLoggedDto,
          userEntity,
        );

      expect(userActivatedEventDto.id).toEqual(userEntity.id);
      expect(userActivatedEventDto.name).toEqual(userEntity.name);
      expect(userActivatedEventDto.email).toEqual(userEntity.email);
      expect(userActivatedEventDto.last).toEqual(userEntity.last);
      expect(userActivatedEventDto.roles).toEqual(userEntity.roles);
    });

    it('should call reqRolesToRolesArray to convert roles', () => {
      const reqUser = MOCK.MOCK_userReqUserDto;

      const reqRolesToRolesArraySpy = jest.spyOn(
        userMapper,
        'reqRolesToRolesArray',
      );

      userMapper.reqUserToUserDto(reqUser);

      expect(reqRolesToRolesArraySpy).toHaveBeenCalledWith(reqUser.roles);
    });
  });

  describe('reqUserToUserCreationDto', () => {
    it('should convert reqUser to UserCreationDto', () => {
      const reqUser = { ...MOCK.MOCK_userEntity, password: MOCK.MOCK_password };

      const userCreationDto = userMapper.reqUserToUserCreationDto(reqUser);

      expect(userCreationDto.id).toEqual(reqUser.id);
      expect(userCreationDto.name).toEqual(reqUser.name);
      expect(userCreationDto.email).toEqual(reqUser.email);
      expect(userCreationDto.last).toEqual(reqUser.last);
      expect(userCreationDto.roles).toEqual(reqUser.roles);
      expect(userCreationDto.password).toEqual(reqUser.password);
    });
  });

  describe('reqRolesToRolesArray', () => {
    it('should return an empty array if roles is null or undefined', () => {
      expect(userMapper.reqRolesToRolesArray(null)).toEqual([]);
      expect(userMapper.reqRolesToRolesArray(undefined)).toEqual([]);
    });

    it('should return an empty array if roles is an empty array', () => {
      expect(userMapper.reqRolesToRolesArray([])).toEqual([]);
    });

    it('should filter valid roles', () => {
      const roles = ['USER', 'ADMIN', 'INVALID_ROLE'];
      const filteredRoles = userMapper.reqRolesToRolesArray(roles);
      expect(filteredRoles).toContain(Role.User);
      expect(filteredRoles).toContain(Role.Admin);
      expect(filteredRoles).not.toContain('INVALID_ROLE');
    });
  });

  describe('UserEntityToUserDto', () => {
    it('should convert UserEntity to UserDto', () => {
      const userEntity: UserEntity = MOCK.MOCK_userEntity;

      const userDto = userMapper.userEntityToUserDto(userEntity);

      expect(userDto.id).toEqual(userEntity.id);
      expect(userDto.name).toEqual(userEntity.name);
      expect(userDto.email).toEqual(userEntity.email);
      expect(userDto.last).toEqual(userEntity.last);
      expect(userDto.roles).toEqual(userEntity.roles);
    });
  });

  describe('userCreationDtoToUserEntity', () => {
    it('should convert UserCreationDto to UserEntity', async () => {
      const userCreationDto: UserCreationDto = {
        id: MOCK.MOCK_userEntity.id,
        name: MOCK.MOCK_userEntity.name,
        email: MOCK.MOCK_userEntity.email,
        last: MOCK.MOCK_userEntity.last,
        roles: [Role.User],
        password: MOCK.MOCK_password,
      };

      const userEntity =
        await userMapper.userCreationDtoToUserEntity(userCreationDto);

      expect(userEntity.id).toEqual(userCreationDto.id);
      expect(userEntity.name).toEqual(userCreationDto.name);
      expect(userEntity.email).toEqual(userCreationDto.email);
      expect(userEntity.last).toEqual(userCreationDto.last);
      expect(userEntity.roles).toEqual(userCreationDto.roles);
    });

    it('should throw HttpException if user validation fails', async () => {
      // Prepare invalid user
      const userCreationDto: UserCreationDto = {
        id: MOCK.MOCK_userEntity.id,
        name: MOCK.MOCK_userEntity.name,
        email: 'invalid_email', // Invalid email
        last: MOCK.MOCK_userEntity.last,
        roles: [Role.User],
        password: MOCK.MOCK_password,
      };

      // Test validation error
      await expect(
        userMapper.userCreationDtoToUserEntity(userCreationDto),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('userEntityToUserCreatedEventDto', () => {
    it('should convert UserEntity to UserCreatedEventDto', () => {
      const userEntity: UserEntity = MOCK.MOCK_userEntity;

      const userCreatedEventDto: UserCreatedEventDto =
        userMapper.userEntityToUserCreatedEventDto(
          MOCK.MOCK_userLoggedDto,
          userEntity,
          MOCK.MOCK_activationToken,
        );

      expect(userCreatedEventDto.id).toEqual(userEntity.id);
      expect(userCreatedEventDto.name).toEqual(userEntity.name);
      expect(userCreatedEventDto.email).toEqual(userEntity.email);
      expect(userCreatedEventDto.last).toEqual(userEntity.last);
      expect(userCreatedEventDto.roles).toEqual(userEntity.roles);
    });

    it('should convert UserEntity to UserCreatedEventDto', () => {
      const userEntity: UserEntity = MOCK.MOCK_userEntity;
      try {
        userMapper.userEntityToUserCreatedEventDto(
          MOCK.MOCK_userLoggedDto,
          userEntity,
          '',
        );
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBeInstanceOf(InvalidTokenException);
        expect(error.message).toEqual('invalid token');
      }
    });
  });

  describe('userReqRegisterUserToRegisterUserDto', () => {
    it('should convert userReqRegisterUser to RegisterUserDto', () => {
      const userReqRegister = MOCK.MOCK_userReqUserRegisterDto;

      const registerUserDto =
        userMapper.userReqRegisterUserToRegisterUserDto(userReqRegister);

      expect(registerUserDto.id).toEqual(userReqRegister.id);
      expect(registerUserDto.name).toEqual(userReqRegister.name);
      expect(registerUserDto.email).toEqual(userReqRegister.email);
      expect(registerUserDto.last).toEqual(userReqRegister.last);
      expect(registerUserDto.password).toEqual(userReqRegister.password);
    });
  });

  describe('userRegisterDto', () => {
    it('should convert userRegisterDto to UserEntity', async () => {
      const userRegisterDto: UserRegisterDto = MOCK.MOCK_userRegisterDto;

      const userEntity =
        await userMapper.userRegisterDtoToUserEntity(userRegisterDto);

      expect(userEntity.id).toEqual(userRegisterDto.id);
      expect(userEntity.name).toEqual(userRegisterDto.name);
      expect(userEntity.email).toEqual(userRegisterDto.email);
      expect(userEntity.last).toEqual(userRegisterDto.last);
      expect(userEntity.roles).toEqual([Role.User]);
    });

    it('should throw HttpException if user validation fails', async () => {
      const userRegisterDto: UserRegisterDto = {
        ...MOCK.MOCK_userRegisterDto,
        email: 'invalid-email',
      };

      await expect(
        userMapper.userRegisterDtoToUserEntity(userRegisterDto),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('userEntityUpdateFromUserProfileDto', () => {
    it('should update userEntity from profileDto', async () => {
      const userEntity: UserEntity = MOCK.MOCK_userEntity;
      const profileDto: UserProfileDto = MOCK.MOCK_userProfileDto;

      const updatedUserEntity =
        await userMapper.userEntityUpdateFromUserProfileDto(
          userEntity,
          profileDto,
        );

      expect(updatedUserEntity.name).toEqual(profileDto.name);
      expect(updatedUserEntity.email).toEqual(profileDto.email);
      expect(updatedUserEntity.last).toEqual(profileDto.last);
    });

    it('should throw HttpException if user validation fails', async () => {
      const userEntity: UserEntity = MOCK.MOCK_userEntity;
      const profileDto: UserProfileDto = {
        ...MOCK.MOCK_userProfileDto,
        email: '',
      };

      await expect(
        userMapper.userEntityUpdateFromUserProfileDto(userEntity, profileDto),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('userReqUserProfileToUserProfileDto', () => {
    it('should convert userReqUserProfile to profileDto', () => {
      const userReqUserProfile = MOCK.MOCK_userReqUserProfileDto;
      const id = '1';

      const profileDto = userMapper.userReqUserProfileDtoToUserProfileDto(
        userReqUserProfile,
        id,
      );

      expect(profileDto.id).toEqual(id);
      expect(profileDto.name).toEqual(userReqUserProfile.name);
      expect(profileDto.email).toEqual(userReqUserProfile.email);
      expect(profileDto.last).toEqual(userReqUserProfile.last);
    });
  });

  describe('userReqUserProfileToUserProfileDto', () => {
    it('should return exception for invalid id', () => {
      const userReqUserProfile = MOCK.MOCK_userReqUserProfileDto;
      const id = '';

      expect(() => {
        userMapper.userReqUserProfileDtoToUserProfileDto(
          userReqUserProfile,
          id,
        );
      }).toThrow('invalid id');
    });
  });

  describe('userEntityToUserProfileDto', () => {
    it('should convert userEntity to userProfileDto', () => {
      const userEntity: UserEntity = MOCK.MOCK_userEntity;

      const userProfileDto = userMapper.userEntityToUserProfileDto(userEntity);

      expect(userProfileDto.id).toEqual(userEntity.id);
      expect(userProfileDto.name).toEqual(userEntity.name);
      expect(userProfileDto.email).toEqual(userEntity.email);
      expect(userProfileDto.last).toEqual(userEntity.last);
    });
  });

  describe('userEntityToUserEnabledEventDto', () => {
    it('should convert UserEntity to UserEnabledEventDto', () => {
      const userEntity = { ...MOCK.MOCK_userEntity };

      const userEnabledEventDto: UserEnabledEventDto =
        userMapper.userEntityToUserEnabledEventDto(
          MOCK.MOCK_userLoggedDto,
          userEntity,
        );

      expect(userEnabledEventDto.id).toEqual(userEntity.id);
      expect(Object.keys(userEnabledEventDto)).toEqual(
        expect.arrayContaining(['id']),
      );
    });
  });

  describe('userEntityToUserDisabledEventDto', () => {
    it('should convert UserEntity to UserDisabledEventDto', () => {
      const userEntity = { ...MOCK.MOCK_userEntity };

      const userDisabledEventDto: UserDisabledEventDto =
        userMapper.userEntityToUserDisabledEventDto(
          MOCK.MOCK_userLoggedDto,
          userEntity,
        );

      expect(userDisabledEventDto.id).toEqual(userEntity.id);
      expect(Object.keys(userDisabledEventDto)).toEqual(
        expect.arrayContaining(['id']),
      );
    });
  });

  describe('userEntityToUserRegisteredEventDto', () => {
    it('should convert userEntity To UserRegisteredEventDto', () => {
      const userRegisteredEventDto: UserRegisteredEventDto =
        userMapper.userEntityToUserRegisteredEventDto(
          MOCK.MOCK_userLoggedDto,
          MOCK.MOCK_userEntity,
          MOCK.MOCK_activationToken,
        );

      expect(userRegisteredEventDto).toEqual(MOCK.MOCK_userRegisteredEventDto);
    });
  });

  describe('userEntityToUserRegisteredEventDto', () => {
    it('should convert userEntity To UserRegisteredEventDto', () => {
      const userRegisteredEventDto: UserRegisteredEventDto =
        userMapper.userEntityToUserRegisteredEventDto(
          MOCK.MOCK_userLoggedDto,
          MOCK.MOCK_userEntity,
          MOCK.MOCK_activationToken,
        );

      expect(userRegisteredEventDto).toEqual(MOCK.MOCK_userRegisteredEventDto);
    });
  });

  describe('userCreationDtoToUserAddedEventDto', () => {
    it('should convert userCreationDto To UserAddedEventDto', async () => {
      const userAddedEventDto: UserAddedEventDto =
        await userMapper.userCreationDtoToUserAddedEventDto(
          MOCK.MOCK_userLoggedDto,
          MOCK.MOCK_userCreationDto,
          MOCK.MOCK_activationToken,
        );

      expect(userAddedEventDto).toEqual(MOCK.MOCK_UserAddedEventDto);
    });
  });

  describe('userRegisterDtoToUserAddedEventDto', () => {
    it('should convert userRegisterDto To UserAddedEventDto', async () => {
      const userAddedEventDto: UserAddedEventDto =
        await userMapper.userRegisterDtoToUserAddedEventDto(
          MOCK.MOCK_userLoggedDto,
          MOCK.MOCK_userRegisterDto,
          MOCK.MOCK_activationToken,
        );

      expect(userAddedEventDto).toEqual(MOCK.MOCK_UserAddedEventDto);
    });

    it('should return exception for invalid token', async () => {
      try {
        await userMapper.userRegisterDtoToUserAddedEventDto(
          MOCK.MOCK_userLoggedDto,
          MOCK.MOCK_userRegisterDto,
          '',
        );
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBeInstanceOf(InvalidTokenException);
        expect(error.message).toEqual('invalid token');
      }
    });
  });

  describe('userRegisterDtoToUserAddedEventDto', () => {
    it('cant convert userRegisterDto To UserAddedEventDto (Invalid password)', async () => {
      const invalidUserRegisterDto: UserRegisterDto = {
        ...MOCK.MOCK_userRegisterDto,
        password: 'weak',
      };

      expect(async () => {
        await userMapper.userRegisterDtoToUserAddedEventDto(
          MOCK.MOCK_userLoggedDto,
          invalidUserRegisterDto,
          MOCK.MOCK_activationToken,
        );
      }).rejects.toThrow(
        'password must be longer than or equal to 8 characters',
      );
    });
  });

  describe('userEntityToUserDeletedEventDto', () => {
    it('should convert userEntity To UserDeletedEventDto', async () => {
      const userDeletedEventDto: UserDeletedEventDto =
        userMapper.userEntityToUserDeletedEventDto(
          MOCK.MOCK_userLoggedDto,
          MOCK.MOCK_userEntity.id,
        );

      expect(userDeletedEventDto).toEqual(MOCK.MOCK_userDeletedEventDto);
    });

    it('should return exception for invalid id ', async () => {
      try {
        userMapper.userEntityToUserDeletedEventDto(MOCK.MOCK_userLoggedDto, '');
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toEqual('invalid id');
      }
    });
  });

  describe('userCreationDtoToUserAddedEventDto', () => {
    it('cant convert userCreationDto To UserAddedEventDto (Invalid password)', async () => {
      const invalidUserCreationDto: UserCreationDto = {
        ...MOCK.MOCK_userCreationDto,
        password: 'weak',
      };

      expect(async () => {
        await userMapper.userCreationDtoToUserAddedEventDto(
          MOCK.MOCK_userLoggedDto,
          invalidUserCreationDto,
          MOCK.MOCK_activationToken,
        );
      }).rejects.toThrow(
        'password must be longer than or equal to 8 characters',
      );
    });
  });
});
