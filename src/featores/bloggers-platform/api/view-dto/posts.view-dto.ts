import { PostDocument, PostDocumentSQL } from '../../domain/posts.entity';

class usersForLikes {
  addedAt: string;
  userId: string;
  login: string;
}

export class PostViewDto {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: {
    likesCount: number;
    dislikesCount: number;
    myStatus: string;
    newestLikes: [] | usersForLikes[];
  };

  static mapToView(
    post: PostDocumentSQL,
    newestLikes: Array<usersForLikes>,
    status?: string,
  ): PostViewDto {
    const dto = new PostViewDto();
    dto.id = post.p_id;
    dto.title = post.p_title;
    dto.shortDescription = post.p_shortDescription;
    dto.content = post.p_content;
    dto.blogId = post.b_id;
    dto.blogName = post.b_name;
    dto.createdAt = post.p_created_at;
    dto.extendedLikesInfo = {
      likesCount: Number(post.likesCount),
      dislikesCount: Number(post.dislikesCount),
      myStatus: status || 'None',
      newestLikes: newestLikes || [],
    };
    return dto;
  }
}
