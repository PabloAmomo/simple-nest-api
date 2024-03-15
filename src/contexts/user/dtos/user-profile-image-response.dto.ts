import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export interface UserProfileImageResponseDto {
  image: any;
}

export const UserProfileImageResponseDtoDtoKeys: (keyof UserProfileImageResponseDto)[] =
  ['image'];

export const ApiUserProfileImageResponseDto: SchemaObject &
  Partial<ReferenceObject> = {
  type: 'object',
  properties: {
    image: {
      type: 'string',
      format: 'binary',
    },
  },
  required: ['name'],
};
