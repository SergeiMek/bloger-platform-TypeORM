export class CreateCommentDomainDto {
  content: string;
  userId: string;
  postId: string;
  userLogin: string;
}

export class UpdateCommentDto {
  content: string;
}
