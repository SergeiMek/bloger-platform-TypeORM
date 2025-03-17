import {
  CommentDocumentSQL,
  likeCountType,
} from '../../domain/comments.entity';

export class CommentViewDto {
  id: string;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
  };
  static mapToView(
    comment: CommentDocumentSQL,
    likeStatus?: string,
  ): CommentViewDto {
    const dto = new CommentViewDto();
    dto.id = comment.id;
    dto.content = comment.content;
    dto.commentatorInfo = {
      userId: comment.userId,
      userLogin: comment.userLogin,
    };
    dto.createdAt = comment.createdAt;
    dto.likesInfo = {
      likesCount: Number(comment.likesCount) || 0,
      dislikesCount: Number(comment.dislikesCount) || 0,
      myStatus: likeStatus || 'None',
    };
    return dto;
  }
}
