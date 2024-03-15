import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export interface UserProfileImageUploadResponseDto {
  name: string;
}

export const UserProfileImageUploadResponseDtoKeys: (keyof UserProfileImageUploadResponseDto)[] =
  ['name'];

export const ApiUserProfileImageUploadResponseDto: SchemaObject &
  Partial<ReferenceObject> = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
    },
  },
  required: ['name'],
};
