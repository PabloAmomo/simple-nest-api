import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { getValidationMessage } from '@functions/get-validation-message.function';
import { UserEntity } from './user.entity';
import { UserDto } from '@contexts/user/dtos/user.dto';

const userValidator = async (
  user: UserEntity | UserDto | any,
  skipMissingProperties?: boolean,
): Promise<string> => {
  const errors = await validate(plainToClass(UserEntity, user), {
    skipMissingProperties,
    whitelist: true,
  });
  const message = getValidationMessage(errors);
  return message;
};

export default userValidator;
