import { ApiRoleArray, Role } from '@core/enums/role.enum';

export interface UserReqUserDto {
  id: string;
  name: string;
  last: string;
  email: string;
  roles: Role[] | string[];
}

export const UserReqUserDtoKeys: (keyof UserReqUserDto)[] = [
  'id',
  'name',
  'last',
  'email',
  'roles',
];

export const ApiUserReqUserDto = {
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
  },
  required: ['id', 'name', 'last', 'email', 'roles'],
};
