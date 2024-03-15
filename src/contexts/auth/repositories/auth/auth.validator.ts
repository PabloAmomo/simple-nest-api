import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { getValidationMessage } from '@functions/get-validation-message.function';
import { AuthEntity } from './auth.entity';

const authValidator = async (
  authEntity: Partial<AuthEntity>,
  skipMissingProperties?: boolean,
): Promise<string> => {
  const errors = await validate(plainToClass(AuthEntity, authEntity), {
    skipMissingProperties,
    whitelist: true,
  });
  const message = getValidationMessage(errors);
  return message;
};

export default authValidator;
