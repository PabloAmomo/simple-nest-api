import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export interface UserProfileDto {
  id: string;
  name: string;
  last: string;
  email: string;
}

export const UserProfileDtoKeys: (keyof UserProfileDto)[] = [
  'id',
  'name',
  'last',
  'email',
];

export const ApiUserProfileDto: SchemaObject & Partial<ReferenceObject> = {
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
      format: 'email',
    },
  },
  required: ['id', 'name', 'last', 'email'],
};
