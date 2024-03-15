import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export interface AuthReqValidationTokenDto {
  activationToken: string;
}

export const AuthReqValidationTokenDtoKeys: (keyof AuthReqValidationTokenDto)[] =
  ['activationToken'];

export const ApiAuthReqValidationTokenDto: SchemaObject &
  Partial<ReferenceObject> = {
  type: 'object',
  properties: {
    activationToken: {
      type: 'string',
    },
  },
};
