import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../domain/question.entity';
import { Repository } from 'typeorm';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}
  async findQuestion(questionId: string): Promise<Question | null> {
    try {
      return await this.questionRepository
        .createQueryBuilder('q')
        .where(`q.id = :questionId`, { questionId })
        .getOne();
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  async deleteQuestion(questionId: string): Promise<boolean> {
    const result = await this.questionRepository
      .createQueryBuilder('q')
      .delete()
      .from(Question)
      .where('id = :questionId', { questionId: questionId })
      .execute();
    return result.affected === 1;
  }
  async findRandomQuestions(): Promise<Question[]> {
    return await this.questionRepository
      .createQueryBuilder('q')
      .where('q.published = true')
      .orderBy('RANDOM()')
      .take(5)
      .getMany();
  }
}
