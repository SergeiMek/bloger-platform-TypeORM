export class CreateCommentDto {
  userId: string;
  content: string;
  postId: string;
}

export class UpdateCommentDto {
  userId: string;
  commentId: string;
  content: string;
}

export class UpdateLikeStatusDto {
  userId: string;
  likeStatus: string;
  commentId: string;
}
