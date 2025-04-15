import { Question } from '../featores/quiz-game/domain/question.entity';
import { Game } from '../featores/quiz-game/domain/game.entity';
import { Player } from '../featores/quiz-game/domain/player.entity';
import { Answer } from '../featores/quiz-game/domain/answer.entity';

export type TypeORMEntity = Question | Game | Player | Answer;
