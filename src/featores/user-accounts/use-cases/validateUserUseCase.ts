import { UserContextDto } from '../guards/dto/user-context.dto';
import { UsersRepository } from '../infrastructure/users.repository';
import { CryptoService } from '../application/crypto.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class ValidateUserCommand {
  constructor(
    public loginOrEmail: string,
    public password: string,
  ) {}
}

@CommandHandler(ValidateUserCommand)
export class ValidateUserUseCase
  implements ICommandHandler<ValidateUserCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
  ) {}
  async execute(command: ValidateUserCommand): Promise<UserContextDto | null> {
    //// проверка на правильность пароля
    const user = await this.usersRepository.findByLoginOrEmail(
      command.loginOrEmail,
    );
    if (!user) {
      return null;
    }
    const isPasswordValid = await this.cryptoService.comparePasswords(
      command.password,
      user.passwordHash,
      user.passwordSalt,
    );
    if (!isPasswordValid) {
      return null;
    }

    return { id: user.id };
  }
}
