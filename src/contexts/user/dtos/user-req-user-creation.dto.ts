import { ApiRoleArray, Role } from '@core/enums/role.enum';
import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export interface UserReqUserCreationDto {
  id: string;
  name: string;
  last: string;
  email: string;
  roles: Role[] | string[];
  password: string;
}

export const UserReqUserCreationDtoKeys: (keyof UserReqUserCreationDto)[] = [
  'id',
  'name',
  'last',
  'email',
  'roles',
  'password',
];

export const ApiUserReqUserCreationDto: SchemaObject &
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
    roles: ApiRoleArray,
    password: {
      type: 'string',
    },
  },
  required: ['id', 'name', 'last', 'email', 'roles', 'password'],
};
