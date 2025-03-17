import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { Injectable } from '@nestjs/common';

@ValidatorConstraint({ name: 'BlogIsExist', async: true })
@Injectable()
export class BlogIsExistConstraint implements ValidatorConstraintInterface {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validate(blogId: string, args: ValidationArguments) {
    return await this.blogsRepository.findBlogOfValidation(blogId);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultMessage(args: ValidationArguments) {
    return 'Post for blog not found'; // Сообщение об ошибке
  }
}

export function IsFindBlogId(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      //  name: 'isAString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: BlogIsExistConstraint,
    });
  };
}
