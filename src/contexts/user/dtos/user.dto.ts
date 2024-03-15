import { Role } from '@core/enums/role.enum';
import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export interface UserDto {
  id: string;
  name: string;
  last: string;
  email: string;
  roles: Role[];
}

export const UserDtoKeys: (keyof UserDto)[] = [
  'id',
  'name',
  'last',
  'email',
  'roles',
];

export const ApiUserDto: SchemaObject & Partial<ReferenceObject> = {
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
    roles: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
  required: ['id', 'name', 'last', 'email', 'roles'],
};

export const ApiUserDtoArray: SchemaObject & Partial<ReferenceObject> = {
  type: 'Array',
  items: ApiUserDto,
};
