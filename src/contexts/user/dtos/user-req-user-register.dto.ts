import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export interface UserReqUserRegisterDto {
  id: string;
  name: string;
  last: string;
  email: string;
  password: string;
}

export const UserReqUserRegisterDtoKeys: (keyof UserReqUserRegisterDto)[] = [
  'id',
  'name',
  'last',
  'email',
  'password',
];

export const ApiUserReqUserRegisterDto: SchemaObject &
  Partial<ReferenceObject> = {
  type: 'object',
  properties: {
    id: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    last: {
      type: 'string',
    },
    email: {
      type: 'string',
    },
    password: {
      type: 'string',
    },
  },
  required: ['id', 'name', 'last', 'email', 'password'],
};
