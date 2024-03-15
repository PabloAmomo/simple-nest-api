import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export interface AuthLoginResponseDto {
  id: string;
  token: string;
  tokenRefresh: string;
}

export const ApiAuthLoginResponseDto: SchemaObject & Partial<ReferenceObject> =
  {
    type: 'object',
    properties: {
      id: {
        type: 'string',
      },
      token: {
        type: 'string',
      },
      tokenRefresh: {
        type: 'string',
      },
    },
  };
