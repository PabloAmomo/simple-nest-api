import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export interface AuthReqChangePasswordDto {
  password: string;
}

export const AuthReqChangePasswordDtoKeys: (keyof AuthReqChangePasswordDto)[] =
  ['password'];

export const ApiAuthReqChangePasswordDto: SchemaObject &
  Partial<ReferenceObject> = {
  type: 'object',
  properties: {
    password: {
      type: 'string',
    },
  },
};
