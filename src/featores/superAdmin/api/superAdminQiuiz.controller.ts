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

import { BasicAuthGuard } from '../../user-accounts/guards/basic/basic-auth.guard';

import { CommandBus } from '@nestjs/cqrs';
import { QuestionInputDto, QuestionPublishInputDto } from '../dto/quizInoutDto';
import { QuestionCreateCommand } from '../aplication/question-create.use-case';
import { QuestionsQuizQueryRepository } from '../../quiz-game/infrastructure/query/questionsQuiz.query-repository';
import { GetQuestionsQueryParams } from './input-dto/get-questions-query-params.input-dto';
import { QuestionDeleteCommand } from '../aplication/question-delete.use-case';
import { QuestionUpdateCommand } from '../aplication/question-update.use-case';
import { QuestionPublishCommand } from '../aplication/question-publish.use-case';

@Controller('sa/quiz/questions')
export class SuperAdminQuizController {
  constructor(
    private commandBus: CommandBus,
    private questionsQueryRepository: QuestionsQuizQueryRepository,
  ) {}

  @Post()
  @UseGuards(BasicAuthGuard)
  async createQuestion(@Body() questionInputDto: QuestionInputDto) {
    const questionId = await this.commandBus.execute(
      new QuestionCreateCommand(questionInputDto),
    );
    return this.questionsQueryRepository.findQuestion(questionId);
  }
  @UseGuards(BasicAuthGuard)
  @Get()
  async findAllQuestions(@Query() query: GetQuestionsQueryParams) {
    return this.questionsQueryRepository.getAllQuestions(query);
  }

  @UseGuards(BasicAuthGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestion(@Param('id') questionId: string) {
    await this.commandBus.execute(new QuestionDeleteCommand(questionId));
  }
  @UseGuards(BasicAuthGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateQuestion(
    @Body() questionInputDto: QuestionInputDto,
    @Param('id') questionId: string,
  ) {
    await this.commandBus.execute(
      new QuestionUpdateCommand(questionInputDto, questionId),
    );
  }
  @UseGuards(BasicAuthGuard)
  @Put(':id/publish')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePublishQuestion(
    @Body() questionPublishInputDto: QuestionPublishInputDto,
    @Param('id') questionId: string,
  ) {
    await this.commandBus.execute(
      new QuestionPublishCommand(questionPublishInputDto, questionId),
    );
  }
}
