import { v4 as uuidv4 } from 'uuid';
import { UsersRepo } from '../infrastructure/users-repo';
import { BadRequestDomainException } from '../../../core/exceptions/domain-exceptions';
import { EmailService } from '../../notifications/email.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { add } from 'date-fns';

export class ResendConfirmationCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(ResendConfirmationCodeCommand)
export class ResendConfirmationCodeUseCase
  implements ICommandHandler<ResendConfirmationCodeCommand>
{
  constructor(
    private usersRepository: UsersRepo,
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
    const data = add(new Date(), { hours: 1 }).toString();
    await this.usersRepository.updateConfirmationCode(
      newConfirmationCode,
      user.id,
      data,
    );
  }
}
