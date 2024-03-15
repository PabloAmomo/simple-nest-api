import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export interface AuthReqLoginEmailDto {
  email: string;
  password: string;
}

export const AuthReqLoginEmailDtoKeys: (keyof AuthReqLoginEmailDto)[] = [
  'email',
  'password',
];

export const ApiAuthReqLoginEmailDto: SchemaObject & Partial<ReferenceObject> =
  {
    type: 'object',
    properties: {
      email: {
        type: 'string',
      },
      password: {
        type: 'string',
      },
    },
  };
