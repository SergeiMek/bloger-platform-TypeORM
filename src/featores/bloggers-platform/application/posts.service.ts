import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreatePostDto,
  updateLikesPostDto,
  UpdatePostDto,
} from '../dto/create-post.dto';
import { PostsRepository } from '../infrastructure/posts.repository';
import { BlogsRepository } from '../infrastructure/blogs.repository';
import { isValidObjectId } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { UsersRepo } from '../../user-accounts/infrastructure/users-repo';
import { Post } from '../domain/posts.entity';
import { Blog } from '../domain/blogs.entity';

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
    const login = user!.login;

    if (!foundUserLikeInfo) {
      await this.postsRepository.pushUserInLikesInfo(
        data.postId,
        data.userId,
        data.likeStatus,
        login,
      );
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
