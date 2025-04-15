import { BadRequestException } from '@nestjs/common';

export const customExceptionFactory = (errors) => {
  const errorsForResponse: any = [];

  errors.forEach((e) => {
    const constraintKeys = Object.keys(e.constraints);

    constraintKeys.forEach((ckey) => {
      errorsForResponse.push({
        message: e.constraints[ckey],
        field: e.property,
      });
    });
  });

  throw new BadRequestException(errorsForResponse);
};
