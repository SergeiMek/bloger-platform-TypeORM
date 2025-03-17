import { HttpException, HttpStatus } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { v4 as uuidv4 } from 'uuid';
//import { add } from 'date-fns/index';
import { add } from 'date-fns';
import { EmailService } from '../../notifications/email.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class SendPasswordRecoveryCodeCommand {
  constructor(public email: string) {}
}

@CommandHandler(SendPasswordRecoveryCodeCommand)
export class SendPasswordRecoveryCodeUseCase
  implements ICommandHandler<SendPasswordRecoveryCodeCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private emailService: EmailService,
  ) {}
  async execute(command: SendPasswordRecoveryCodeCommand): Promise<void> {
    const user = await this.usersRepository.findByLoginOrEmail(command.email);
    if (!user) {
      throw new HttpException('ok', HttpStatus.NO_CONTENT);
    }
    const recoveryCode = uuidv4();
    const expirationDate = add(new Date(), { hours: 1 }).toISOString();
    try {
      this.emailService.sendChangePasswordEmail(user.email, recoveryCode);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
    await this.usersRepository.updatePasswordRecoveryData(
      expirationDate,
      recoveryCode,
      user.id,
    );
  }
}
