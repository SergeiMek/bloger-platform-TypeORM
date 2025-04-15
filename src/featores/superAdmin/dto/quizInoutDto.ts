import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  Length,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class QuestionInputDto {
  @IsNotEmpty()
  @Length(10, 500)
  body: string;

  @IsArray()
  @ArrayNotEmpty()
  @Transform(({ value }) => {
    if (!Array.isArray(value)) {
      return false;
    } else {
      return value.map((a) => a.toString().trim());
    }
  })
  correctAnswers: string[];
}

export class QuestionPublishInputDto {
  @IsNotEmpty()
  @IsBoolean()
  published: boolean;
}
