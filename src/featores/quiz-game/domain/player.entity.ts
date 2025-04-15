import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Game } from './game.entity';
import { Answer } from './answer.entity';
import { UserEntity } from '../../user-accounts/domain/user.entity';

@Entity('quiz_players')
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'score',
    type: 'int',
  })
  score: number;

  @OneToOne(() => Game, {
    onDelete: 'CASCADE',
  })
  game: Game;

  @OneToMany(() => Answer, (answer) => answer.player, {
    onDelete: 'CASCADE',
  })
  answers: Answer[];

  @ManyToOne(() => UserEntity, (user) => user.player, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: UserEntity;
}
