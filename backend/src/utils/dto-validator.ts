import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import logger from './logger';

/**
 * Generic error class for DTO validation failures
 */
export class ValidationError extends Error {
  public errors: any[];

  constructor(message: string, errors: any[]) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

/**
 * Validates a DTO against its class validators
 * @param dtoClass The DTO class
 * @param object The object to validate
 * @returns Validated DTO instance
 * @throws ValidationError if validation fails
 */
export async function validateDTO<T extends object>(
  dtoClass: new () => T,
  object: object
): Promise<T> {
  // Transform plain object to class instance
  const dtoInstance = plainToInstance(dtoClass, object);
  
  // Validate the instance
  const errors = await validate(dtoInstance, {
    whitelist: true, // Remove properties that don't exist in the DTO
    forbidNonWhitelisted: true, // Throw error if extra properties are present
    forbidUnknownValues: true, // Disallow unknown values
  });

  // If there are validation errors
  if (errors.length > 0) {
    // Format errors for better readability
    const formattedErrors = errors.map((error) => ({
      property: error.property,
      constraints: error.constraints,
      value: error.value,
    }));

    // Log the validation error
    logger.error(`DTO validation failed for ${dtoClass.name}`, {
      errors: formattedErrors,
    });

    // Throw a validation error
    throw new ValidationError(
      `Validation failed for ${dtoClass.name}`,
      formattedErrors
    );
  }

  // Return the valid instance
  return dtoInstance;
}

/**
 * Convenience function to transform and validate an array of DTOs
 * @param dtoClass The DTO class
 * @param objects The array of objects to validate
 * @returns Array of validated DTO instances
 */
export async function validateDTOArray<T extends object>(
  dtoClass: new () => T,
  objects: object[]
): Promise<T[]> {
  return Promise.all(objects.map(obj => validateDTO(dtoClass, obj)));
} 