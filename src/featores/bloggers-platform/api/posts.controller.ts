import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from '../application/posts.service';
import { PostsQueryRepository } from '../infrastructure/query/posts.query-repository';
import { PostViewDto } from './view-dto/posts.view-dto';
import { GetPostsQueryParams } from './input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { UserContextDto } from '../../user-accounts/guards/dto/user-context.dto';
import { JwtOptionalAuthGuard } from '../../user-accounts/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserIfExistsFromRequest } from '../../user-accounts/guards/decorators/param/extract-user-if-exists-from-request.decorator';
import { GetCommentsQueryParams } from './input-dto/get-comment-query-params.input-dto';
import { CommentViewDto } from './view-dto/comments.view-dto';
import { JwtAuthGuard } from '../../user-accounts/guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from '../../user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import {
  CreateCommentForPostInputDto,
  UpdateLikeStatusesForPostInputDto,
} from './input-dto/posts.input-dto';
import { CommentsService } from '../application/comments.service';
import { CommentsQueryRepository } from '../infrastructure/query/comments.query-repository';

@Controller('posts')
export class PostsController {
  constructor(
    private postsService: PostsService,
    private postsQueryRepository: PostsQueryRepository,
    private commentService: CommentsService,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}
  @Get()
  @UseGuards(JwtOptionalAuthGuard)
  async getAll(
    @Query() query: GetPostsQueryParams,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.postsQueryRepository.getAll({ query, userId: user?.id });
  }

  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  async getPostById(
    @Param('id') id: string,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<PostViewDto> {
    return this.postsQueryRepository.findPostById(id, user?.id);
  }
  @Get('/:postId/comments')
  @UseGuards(JwtOptionalAuthGuard)
  async getCommentsForPost(
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
    @Query() query: GetCommentsQueryParams,
    @Param('postId') postId: string,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    return this.commentsQueryRepository.getAll(query, postId, user?.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  createCommentForPost(
    @ExtractUserFromRequest() user: UserContextDto,
    @Param('id') postId: string,
    @Body() model: CreateCommentForPostInputDto,
  ): Promise<CommentViewDto> {
    const dto = {
      userId: user.id,
      content: model.content,
      postId: postId,
    };
    return this.commentService.createComment(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  updateLikeStatus(
    @ExtractUserFromRequest() user: UserContextDto,
    @Param('id') postId: string,
    @Body() model: UpdateLikeStatusesForPostInputDto,
  ): Promise<void> {
    const dto = {
      userId: user.id,
      likeStatus: model.likeStatus,
      postId: postId,
    };
    return this.postsService.updateLikesStatus(dto);
  }

  /*@Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string): Promise<void> {
    await this.postsService.deletePost(id);
  }*/
}
