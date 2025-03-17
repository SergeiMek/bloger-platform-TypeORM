import { UsersRepository } from '../infrastructure/users.repository';
import { BadRequestDomainException } from '../../../core/exceptions/domain-exceptions';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class ConfirmEmailCommand {
  constructor(public code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: ConfirmEmailCommand): Promise<void> {
    const user = await this.usersRepository.findUserByConfirmCode(command.code);
    debugger;
    if (!user) {
      throw BadRequestDomainException.create('the user already exists', 'code');
    }
    if (user.isConfirmed) {
      throw BadRequestDomainException.create('user is confirmed', 'code');
    }
    if (user.expirationData! < new Date()) {
      throw BadRequestDomainException.create(
        'the deadline has expired',
        'code',
      );
    }
    await this.usersRepository.updateConfirmationStatus(user.id);
  }
}
