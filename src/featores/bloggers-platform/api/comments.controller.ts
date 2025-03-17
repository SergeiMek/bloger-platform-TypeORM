import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from '../application/comments.service';
import { CommentsQueryRepository } from '../infrastructure/query/comments.query-repository';
import {
  UpdateCommentInputDto,
  UpdateLikeStatusInputDto,
} from './input-dto/comments.input-dto';
import { JwtAuthGuard } from '../../user-accounts/guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from '../../user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { UserContextDto } from '../../user-accounts/guards/dto/user-context.dto';
import { ExtractUserIfExistsFromRequest } from '../../user-accounts/guards/decorators/param/extract-user-if-exists-from-request.decorator';
import { JwtOptionalAuthGuard } from '../../user-accounts/guards/bearer/jwt-optional-auth.guard';
import { CommentViewDto } from './view-dto/comments.view-dto';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentsService: CommentsService,
    private commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  getCommentById(
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
    @Param('id') id: string,
  ): Promise<CommentViewDto> {
    return this.commentsQueryRepository.findCommentById(id, user?.id);
  }
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  updateComment(
    @ExtractUserFromRequest() user: UserContextDto,
    @Param('id') commentId: string,
    @Body() model: UpdateCommentInputDto,
  ): Promise<void> {
    return this.commentsService.updateComment({
      userId: user.id,
      commentId: commentId,
      content: model.content,
    });
  }
  @UseGuards(JwtAuthGuard)
  @Put(':id/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  updateLikeStatus(
    @ExtractUserFromRequest() user: UserContextDto,
    @Param('id') commentId: string,
    @Body() model: UpdateLikeStatusInputDto,
  ): Promise<void> {
    return this.commentsService.updateLikeStatus({
      userId: user.id,
      commentId: commentId,
      likeStatus: model.likeStatus,
    });
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteComment(
    @Param('id') id: string,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<void> {
    return this.commentsService.deleteComment(id, user.id);
  }
}
