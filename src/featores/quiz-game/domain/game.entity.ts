import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from './question.entity';
import { GameStatus } from '../../../enums/game-status.enum';
import { Player } from './player.entity';

@Entity('quiz_games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  status: GameStatus;

  @CreateDateColumn({
    name: 'pair_created_date',
    type: 'timestamp with time zone',
  })
  pairCreatedDate: Date;

  @Column({
    name: 'start_game_date',
    type: 'timestamp with time zone',
    nullable: true,
  })
  startGameDate: Date;

  @Column({
    name: 'finish_game_date',
    type: 'timestamp with time zone',
    nullable: true,
  })
  finishGameDate: Date;

  @Column({
    name: 'finish_expiration_date',
    type: 'timestamp with time zone',
    nullable: true,
  })
  finishingExpirationDate: Date | null;

  @OneToOne(() => Player, (player) => player.game, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  playerOne: Player;

  @OneToOne(() => Player, (player) => player.game, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  playerTwo: Player;

  @ManyToMany(() => Question, (question) => question.games, {
    onDelete: 'CASCADE',
  })
  questions: Question[];
}
