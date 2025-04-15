import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from '../../user-accounts/application/users.service';
import { UsersQueryRepository } from '../../user-accounts/infrastructure/query/users.query-repository';
import { UsersRepo } from '../../user-accounts/infrastructure/users-repo';
import { BasicAuthGuard } from '../../user-accounts/guards/basic/basic-auth.guard';
import { GetUsersQueryParams } from '../../user-accounts/api/input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { UserViewDto } from '../../user-accounts/api/view-dto/users.view-dto';
import { CreateUserInputDto } from '../../user-accounts/api/input-dto/users.input-dto';
import {
  CreateBlogForPostDto,
  CreateBlogInputDto,
} from '../../bloggers-platform/api/input-dto/blogs.input-dto';
import { BlogViewDto } from '../../bloggers-platform/api/view-dto/blogs.view-dto';
import { BlogsService } from '../../bloggers-platform/application/blogs.service';
import { BlogsQueryRepository } from '../../bloggers-platform/infrastructure/query/blogs.query-repository';
import { PostViewDto } from '../../bloggers-platform/api/view-dto/posts.view-dto';
import { PostsService } from '../../bloggers-platform/application/posts.service';
import { PostsQueryRepository } from '../../bloggers-platform/infrastructure/query/posts.query-repository';
import { UpdatePostDtoForBlog } from '../../bloggers-platform/api/input-dto/posts.input-dto';
import { GetPostsQueryParams } from '../../bloggers-platform/api/input-dto/get-posts-query-params.input-dto';
import { GetBlogsQueryParams } from '../../bloggers-platform/api/input-dto/get-blogs-query-params.input-dto';

@Controller('sa')
export class SuperAdminController {
  constructor(
    private usersService: UsersService,
    private usersQueryRepository: UsersQueryRepository,
    private usersRepository: UsersRepo,
    private blogsService: BlogsService,
    private blogsQueryRepository: BlogsQueryRepository,
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
  ) {}

  @UseGuards(BasicAuthGuard)
  @Get('/users')
  async getAll(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    return this.usersQueryRepository.getAll(query);
  }

  @Get('/tests/:id')
  async getTests(@Param('id') id: string) {
    // return this.usersQueryRepository.getAll(query);
    return this.postsQueryRepository.findPostById(id);
  }

  @UseGuards(BasicAuthGuard)
  @Post('/users')
  async createUser(@Body() body: CreateUserInputDto): Promise<UserViewDto> {
    const userId = await this.usersService.createUser(body);
    return this.usersQueryRepository.getUserById(userId);
  }

  @UseGuards(BasicAuthGuard)
  @Delete('/users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string): Promise<void> {
    return this.usersService.deleteUser(id);
  }

  @UseGuards(BasicAuthGuard)
  @Post('/blogs')
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const blogId = await this.blogsService.createBlog(body);
    return this.blogsQueryRepository.findBlogById(blogId);
  }

  @UseGuards(BasicAuthGuard)
  @Put('/blogs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Param('id') userId: string,
    @Body() model: CreateBlogInputDto,
  ): Promise<void> {
    await this.blogsService.updateBlog(userId, model);
  }

  @UseGuards(BasicAuthGuard)
  @Delete('/blogs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    await this.blogsService.deleteBlog(id);
  }
  @UseGuards(BasicAuthGuard)
  @Post('/blogs/:blogId/posts')
  async createdPostForBlog(
    @Param('blogId') blogId: string,
    @Body() body: CreateBlogForPostDto,
  ): Promise<PostViewDto> {
    const postId = await this.postsService.createPost({ ...body, blogId });
    return this.postsQueryRepository.findPostById(postId);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put('/blogs/:blogId/posts/:postId')
  @UseGuards(BasicAuthGuard)
  updatePost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() model: UpdatePostDtoForBlog,
  ): Promise<void> {
    return this.postsService.updatePost(postId, model, blogId);
  }
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('/blogs/:blogId/posts/:postId')
  @UseGuards(BasicAuthGuard)
  deletePostFor(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
  ): Promise<void> {
    return this.postsService.deletePostForBlog(postId, blogId);
  }
  @Get('/blogs')
  @UseGuards(BasicAuthGuard)
  async getAllBlogs(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.blogsQueryRepository.getAll(query);
  }
  @Get('/blogs/:blogId/posts')
  @UseGuards(BasicAuthGuard)
  async getPostsForBlog(
    @Query() query: GetPostsQueryParams,
    @Param('blogId') blogId: string,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.blogsQueryRepository.getPostsForBlog({ query, blogId });
  }
}
