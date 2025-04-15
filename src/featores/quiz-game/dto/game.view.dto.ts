import { Answer } from '../domain/answer.entity';
import { GameStatus } from '../../../enums/game-status.enum';
import { AnswerStatus } from '../../enums/answer-status.enum';

export class GameViewDto {
  id: string;
  firstPlayerProgress: {
    answers: AnswerViewDto[] | [];
    player: PlayerViewDto;
    score: number;
  };
  secondPlayerProgress: {
    answers: Answer[] | [];
    player: PlayerViewDto;
    score: number;
  } | null;
  questions: QuestionViewDto[] | null;
  status: GameStatus;
  pairCreatedDate: Date;
  startGameDate: Date | null;
  finishGameDate: Date | null;
}

export class PlayerViewDto {
  id: string;
  login: string;
}

class QuestionViewDto {
  id: string;
  body: string;
}

export class AnswerViewDto {
  questionId: string;
  answerStatus: AnswerStatus;
  addedAt: Date;
}
