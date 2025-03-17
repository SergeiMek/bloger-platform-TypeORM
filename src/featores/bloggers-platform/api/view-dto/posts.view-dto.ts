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
    dto.id = post.id;
    dto.title = post.title;
    dto.shortDescription = post.shortDescription;
    dto.content = post.content;
    dto.blogId = post.blogId;
    dto.blogName = post.blogName;
    dto.createdAt = post.createdAt;
    dto.extendedLikesInfo = {
      likesCount: Number(post.likesCount),
      dislikesCount: Number(post.dislikesCount),
      myStatus: status || 'None',
      newestLikes: newestLikes || [],
    };
    debugger;
    return dto;
  }
}
