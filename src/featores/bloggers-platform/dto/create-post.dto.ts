import { GetPostsQueryParams } from '../api/input-dto/get-posts-query-params.input-dto';

export class CreatePostDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}

export class UpdatePostDto {
  title: string;
  shortDescription: string;
  content: string;
  blogId?: string;
}

export type updateLikesPostDto = {
  postId: string;
  userId: string;
  likeStatus: string;
};

export type pushUserInLikesInfoDto = {
  postId: string;
  userId: string;
  userLogin: string;
  likeStatus: string;
};

export type updateLikesCount = {
  likesCount: number;
  dislikesCount: number;
};
export type updateLikesStatusDto = {
  userId: string;
  likeStatus: string;
};

export class getAllPostsDto {
  query: GetPostsQueryParams;
  blogId?: string;
  userId?: string;
}
