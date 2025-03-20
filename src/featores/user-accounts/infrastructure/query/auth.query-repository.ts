import { Injectable } from '@nestjs/common';
import { UsersRepo } from '../users-repo';
import { MeViewDto } from '../../api/view-dto/users.view-dto';

@Injectable()
export class AuthQueryRepository {
  constructor(private usersRepository: UsersRepo) {}

  async me(userId: string): Promise<MeViewDto> {
    const user = await this.usersRepository.findById(userId);
    return MeViewDto.mapToView(user);
  }
}
