import { Injectable } from '@nestjs/common';
import {
  CreatePostDto,
  updateLikesPostDto,
  UpdatePostDto,
} from '../dto/create-post.dto';
import { PostsRepository } from '../infrastructure/posts.repository';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { UsersRepo } from '../../user-accounts/infrastructure/users-repo';
import { Post } from '../domain/posts.entity';
import { LikesForPost } from '../domain/postsLike.entity';

@Injectable()
export class PostsService {
  constructor(
    private postsRepository: PostsRepository,
    private blogsRepository: BlogsRepository,
    private usersRepository: UsersRepo,
  ) {}

  async createPost(dto: CreatePostDto): Promise<string> {
    const blog = await this.blogsRepository.findBlogById(dto.blogId);

    const post = new Post();
    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.createdAt = new Date();
    post.blog = blog;
    const savedPost = await this.postsRepository.createPost(post);
    return savedPost.id;
  }
  async updatePost(
    postId: string,
    body: UpdatePostDto,
    blogId?: string,
  ): Promise<void> {
    const idBlog = blogId || body.blogId;
    await this.blogsRepository.findBlogById(idBlog!);
    await this.postsRepository.updatePost(postId, body);
  }
  async updateLikesStatus(data: updateLikesPostDto): Promise<void> {
    await this.postsRepository.findPostById(data.postId);

    const foundUserLikeInfo = await this.postsRepository.findUserInLikesInfo(
      data.postId,
      data.userId,
    );

    const user = await this.usersRepository.findById(data.userId);
    //const login = user!.login;
    debugger;
    if (!foundUserLikeInfo) {
      debugger;
      const post = await this.postsRepository.findPostById(data.postId);
      const newLike = new LikesForPost();
      newLike.addedAt = new Date().toISOString();
      newLike.userId = user.id;
      newLike.userLogin = user.login;
      newLike.likeStatus = data.likeStatus;
      newLike.post = post;
      await this.postsRepository.pushUserInLikesInfo(newLike);
    }

    await this.postsRepository.updateLikesStatus(
      data.postId,
      data.userId,
      data.likeStatus,
    );
  }
  async deletePostForBlog(postId: string, blogId: string) {
    await this.blogsRepository.findBlogById(blogId);
    await this.postsRepository.deletePost(postId);
  }
}
