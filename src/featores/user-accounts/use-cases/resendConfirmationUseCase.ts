import { v4 as uuidv4 } from 'uuid';
import { UsersRepository } from '../infrastructure/users.repository';
import { BadRequestDomainException } from '../../../core/exceptions/domain-exceptions';
import { EmailService } from '../../notifications/email.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class ResendConfirmationCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(ResendConfirmationCodeCommand)
export class ResendConfirmationCodeUseCase
  implements ICommandHandler<ResendConfirmationCodeCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailService: EmailService,
  ) {}

  async execute(command: ResendConfirmationCodeCommand): Promise<void> {
    const user = await this.usersRepository.findByLoginOrEmail(command.email);
    if (!user) {
      throw BadRequestDomainException.create('user not found', 'email');
    }
    if (user.isConfirmed) {
      debugger;
      throw BadRequestDomainException.create('user is confirmed', 'email');
    }

    const newConfirmationCode = uuidv4();
    try {
      this.emailService.sendChangePasswordEmail(
        user.email,
        newConfirmationCode,
      );
    } catch (error) {
      throw BadRequestDomainException.create(error, 'email');
    }
    /*    this.emailService
      .sendChangePasswordEmail(user.email, newConfirmationCode)
      .catch((error) => {
        throw BadRequestDomainException.create(error, 'email');
      });*/

    await this.usersRepository.updateConfirmationCode(
      newConfirmationCode,
      user.id,
    );
  }
}
