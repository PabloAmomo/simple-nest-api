import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export interface HealthResponseDto {
  status: 'ok' | string;
  time: string;
}

export const ApiHealthResponseDto: SchemaObject & Partial<ReferenceObject> = {
  properties: {
    status: {
      type: 'string',
      enum: ['ok'],
    },
    time: {
      type: 'string',
      format: 'date-time',
    },
  },
  required: ['status', 'time'],
};
