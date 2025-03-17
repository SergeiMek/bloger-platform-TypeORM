//dto для боди при создании юзера. Сюда могут быть добавлены декораторы swagger

import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { likeStatusEnum } from './comments.input-dto';
import { IsFindBlogId } from '../../validate/blogId-is-exist.decorator';

export class CreatePostInputDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 30)
  title: string;
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 100)
  shortDescription: string;
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 1000)
  content: string;
  @IsString()
  @IsFindBlogId()
  blogId: string;
}

export class UpdatePostDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 30)
  title: string;
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 100)
  shortDescription: string;
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 1000)
  content: string;
  @IsString()
  @IsString()
  @IsFindBlogId()
  blogId: string;
}
export class UpdatePostDtoForBlog {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 30)
  title: string;
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 100)
  shortDescription: string;
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(1, 1000)
  content: string;
}

export class CreateCommentForPostInputDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @Length(20, 300)
  content: string;
}

export class UpdateLikeStatusesForPostInputDto {
  @IsString()
  @IsNotEmpty()
  @IsEnum(likeStatusEnum)
  likeStatus: 'None' | 'Like' | 'Dislike';
}
