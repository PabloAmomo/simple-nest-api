import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export interface UserReqUserProfileDto {
  name: string;
  last: string;
  email: string;
}

export const UserReqUserProfileDtoKeys: (keyof UserReqUserProfileDto)[] = [
  'name',
  'last',
  'email',
];

export const ApiUserReqUserProfileDto: SchemaObject & Partial<ReferenceObject> =
  {
    type: 'object',
    properties: {
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
    required: ['name', 'last', 'email'],
  };
