import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { randomUUID } from 'crypto';
import { Answer } from './answer.entity';
import { Game } from './game.entity';

@Entity('quiz_questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', width: 500 })
  body: string;

  @Column({ name: 'correct_answers', type: 'jsonb', default: [] })
  correctAnswers;

  @Column({ type: 'boolean', default: false })
  published: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  updatedAt: Date;

  @OneToMany(() => Answer, (answer) => answer.question)
  answers: Answer[];

  @ManyToMany(() => Game, (game) => game.questions, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinTable()
  games: Game[];

  static checkSortingField(value: any) {
    const q = new Question();
    q.id = randomUUID();
    q.body = '';
    q.published = false;
    q.createdAt = new Date();
    q.updatedAt = new Date();
    return q.hasOwnProperty(value);
  }
}
