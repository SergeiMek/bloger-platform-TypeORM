import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserContextDto } from '../../user-accounts/guards/dto/user-context.dto';
import { JwtAuthGuard } from '../../user-accounts/guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from '../../user-accounts/guards/decorators/param/extract-user-from-request.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { UserConnectCommand } from '../use-case/user-connect';
import { GamesQueryRepository } from '../infrastructure/query/gamesQuery.repository';
import { AnswerInputDto } from '../dto/inputDto';
import { AnswerSendCommand } from '../use-case/answer-send';
import { GameFindQuery } from '../use-case/game-find';
import { GetMyGamesQueryParams } from '../input-dto/get-myGames-query-params.input-dto';
import { GetTopQueryParams } from '../input-dto/get-top-query-params.input-dto';

@Controller('pair-game-quiz')
export class QuizController {
  constructor(
    private commandBus: CommandBus,
    private readonly gamesQueryRepository: GamesQueryRepository,
  ) {}

  @Get('users/top')
  async getTop(@Query() query: GetTopQueryParams) {
    return await this.gamesQueryRepository.getTop(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pairs/my-current')
  async findCurrentGame(@ExtractUserFromRequest() user: UserContextDto) {
    return await this.gamesQueryRepository.findCurrentGame(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('users/my-statistic')
  async getStatistic(@ExtractUserFromRequest() user: UserContextDto) {
    return await this.gamesQueryRepository.getStatistic(user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pairs/my')
  async findMyGames(
    @Query() query: GetMyGamesQueryParams,
    @ExtractUserFromRequest() user: UserContextDto,
  ) {
    return await this.gamesQueryRepository.findMyGames(user.id, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pairs/:id')
  async findGameById(
    @Param('id') id: string,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<any> {
    return await this.commandBus.execute(new GameFindQuery(user.id, id));
  }

  @UseGuards(JwtAuthGuard)
  @Post('pairs/connection')
  @HttpCode(200)
  async connectionPairs(
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<any> {
    const result = await this.commandBus.execute(
      new UserConnectCommand(user.id),
    );
    return this.gamesQueryRepository.findGameById(result);
  }

  @UseGuards(JwtAuthGuard)
  @Post('pairs/my-current/answers')
  @HttpCode(200)
  async sendAnswer(
    @Body() answerInputDto: AnswerInputDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ): Promise<any> {
    const gameId = await this.commandBus.execute(
      new AnswerSendCommand(user.id, answerInputDto),
    );
    debugger;
    return this.gamesQueryRepository.findAnswerInGame(gameId, user.id);
  }
}
