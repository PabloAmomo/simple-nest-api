import { ValidationError } from 'class-validator';

const getValidationMessage = (errors: ValidationError[]): string => {
  if (errors.length === 0) return '';

  return errors
    .map((error: ValidationError) =>
      Object.values(error.constraints).join(', '),
    )
    .join(', ');
};

export { getValidationMessage };
