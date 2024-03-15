import { AuthMapper } from '../auth.mapper';
import { UserDto } from '@contexts/user/dtos/user.dto';
import * as MOCK from '@mocks/app-mocks';
import { HttpException } from '@nestjs/common';
import { AuthEntity } from '@contexts/auth/repositories/auth/auth.entity';
import { UserLoggedDto } from '@core/dtos/user/user-logged.dto';
import { InvalidDataException } from '@core/exceptions/invalid-data.exception';

describe('AuthMapper', () => {
  const authMapper: AuthMapper = new AuthMapper();

  describe('userCreatedEventToAuthEntity', () => {
    test('should return error for invalid userCreatedEvent', () => {
      const userAddedEvent = { ...MOCK.MOCK_userAddedEvent };
      delete userAddedEvent.id;
      expect(
        async () => await authMapper.userAddedEventToAuthEntity(userAddedEvent),
      ).rejects.toThrow('invalid userCreatedEvent');
    });

    test('should convert userAddedEvent To AuthEntity', async () => {
      const authEntity = await authMapper.userAddedEventToAuthEntity(
        MOCK.MOCK_userAddedEvent,
      );

      expect(authEntity).toHaveProperty('id', MOCK.MOCK_userAddedEvent.id);
      expect(authEntity).toHaveProperty(
        'password',
        MOCK.MOCK_userAddedEvent.password,
      );
      expect(authEntity).toHaveProperty('activated', false);
      expect(authEntity).toHaveProperty('activationToken');
    });

    test('Should throw an exception if the validation fails (Invalid Data, musy fail)', async () => {
      try {
        await authMapper.userAddedEventToAuthEntity({
          ...MOCK.MOCK_userAddedEvent,
          id: '',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
      }
    });

    test('Should throw an exception if the validation fails (Validation OK)', async () => {
      try {
        await authMapper.userAddedEventToAuthEntity({
          ...MOCK.MOCK_userAddedEvent,
        });
        expect(true).toBe(true);
      } catch (error) {
        expect(true).toBe(false);
      }
    });

    test('Should use generateRandomToken', async () => {
      try {
        await authMapper.userAddedEventToAuthEntity({} as any);
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error).toBeInstanceOf(InvalidDataException);
        expect(error.message).toBe('invalid userCreatedEvent');
      }
    });
  });

  //
  describe('userEntityToUserDto', () => {
    it('should return error for invalid UserEntity', () => {
      const userEntity = { ...MOCK.MOCK_userEntity };
      delete userEntity.id;
      expect(() => authMapper.userEntityToUserDto(userEntity)).toThrow(
        'invalid UserEntity',
      );
    });

    it('should return correct', () => {
      const userEntity = { ...MOCK.MOCK_userEntity };
      expect(authMapper.userEntityToUserDto(userEntity)).toMatchObject({
        id: MOCK.MOCK_userEntity.id,
        name: MOCK.MOCK_userEntity.name,
        last: MOCK.MOCK_userEntity.last,
        email: MOCK.MOCK_userEntity.email,
        roles: MOCK.MOCK_userEntity.roles,
      });
    });
  });

  describe('userDtoToUserLoggedDto', () => {
    it('should return error for invalid AuthEntity', () => {
      const userDto: UserDto = { ...MOCK.MOCK_userDto };
      delete userDto.id;
      expect(() => authMapper.userDtoToUserLoggedDto(userDto)).toThrow(
        'invalid UserDto',
      );
    });

    it('should convert userDto To UserLoggedDto', () => {
      const userDto: UserDto = MOCK.MOCK_userDto;

      const userLoggedDto: UserLoggedDto =
        authMapper.userDtoToUserLoggedDto(userDto);

      expect(userLoggedDto.id).toEqual(MOCK.MOCK_userDto.id);
      expect(userLoggedDto.name).toEqual(MOCK.MOCK_userDto.name);
      expect(userLoggedDto.email).toEqual(MOCK.MOCK_userDto.email);
      expect(userLoggedDto.last).toEqual(MOCK.MOCK_userDto.last);
      expect(userLoggedDto.roles).toEqual(MOCK.MOCK_userDto.roles);
    });
  });

  describe('authEntityToUserLoggedDto', () => {
    it('should return error for invalid AuthEntity', () => {
      const authEntity: AuthEntity = { ...MOCK.MOCK_authEntity };
      delete authEntity.id;
      expect(() => authMapper.authEntityToUserLoggedDto(authEntity)).toThrow(
        'invalid AuthEntity',
      );
    });

    it('should convert authEntity To UserLoggedDto', () => {
      const authEntity: AuthEntity = MOCK.MOCK_authEntity;

      const userLoggedDto: UserLoggedDto =
        authMapper.authEntityToUserLoggedDto(authEntity);

      expect(userLoggedDto.id).toEqual(MOCK.MOCK_authEntity.id);
      expect(userLoggedDto.name).toEqual('');
      expect(userLoggedDto.email).toEqual('');
      expect(userLoggedDto.last).toEqual('');
      expect(userLoggedDto.roles).toEqual([]);
    });
  });

  describe('userDtoAndTokenToAuthResponseDto', () => {
    it('should return error for invalid id, token or tokenRefresh (Invalid token)', () => {
      expect(() =>
        authMapper.userDtoAndTokenToAuthResponseDto(
          MOCK.MOCK_userEntity.id,
          '',
          MOCK.MOCK_tokenRefresh,
        ),
      ).toThrow('invalid id, token or tokenRefresh');
    });

    it('should return error for invalid id, token or tokenRefresh (Invalid token refresh)', () => {
      expect(() =>
        authMapper.userDtoAndTokenToAuthResponseDto(
          MOCK.MOCK_userEntity.id,
          MOCK.MOCK_token,
          '',
        ),
      ).toThrow('invalid id, token or tokenRefresh');
    });

    it('should return error for invalid id, token or tokenRefresh (Invalid id)', () => {
      expect(() =>
        authMapper.userDtoAndTokenToAuthResponseDto(
          '',
          MOCK.MOCK_token,
          MOCK.MOCK_tokenRefresh,
        ),
      ).toThrow('invalid id, token or tokenRefresh');
    });

    it('should convert UserDto and token to AuthResponseDto', () => {
      const userDto: UserDto = MOCK.MOCK_userEntity;
      const token = 'exampleToken';

      const authResponseDto = authMapper.userDtoAndTokenToAuthResponseDto(
        MOCK.MOCK_userEntity.id,
        token,
        MOCK.MOCK_tokenRefresh,
      );

      expect(authResponseDto.id).toEqual(userDto.id);
      expect(authResponseDto.token).toEqual(token);
      expect(authResponseDto.tokenRefresh).toEqual(MOCK.MOCK_tokenRefresh);
    });
  });
});
