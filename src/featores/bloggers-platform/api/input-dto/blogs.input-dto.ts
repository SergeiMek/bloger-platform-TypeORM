//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBlogInputDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 15)
  @IsNotEmpty()
  name: string;
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 500)
  description: string;
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Matches(
    '^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$',
  )
  @Length(1, 100)
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  websiteUrl: string;
}

export class UpdateBlogInputDto {
  name: string;
  description: string;
  websiteUrl: string;
}
export class CreateBlogForPostDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @Length(1, 30)
  title: string;
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @Length(1, 100)
  shortDescription: string;
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @Length(1, 1000)
  content: string;
}
