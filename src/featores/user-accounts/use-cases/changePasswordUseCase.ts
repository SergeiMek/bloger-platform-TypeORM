import { HttpException, HttpStatus } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { CryptoService } from '../application/crypto.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class ChangePasswordCommand {
  constructor(
    public recoveryCode: string,
    public password: string,
  ) {}
}

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordUseCase
  implements ICommandHandler<ChangePasswordCommand>
{
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
  ) {}

  async execute(command: ChangePasswordCommand): Promise<void> {
    const user = await this.usersRepository.findUserByPasswordRecoveryCode(
      command.recoveryCode,
    );
    if (!user) {
      throw new HttpException('user non found', HttpStatus.BAD_REQUEST);
    }
    const newPasswordData = await this.cryptoService.createPasswordHash(
      command.password,
    );
    debugger;
    await this.usersRepository.updatePassword(
      user.id,
      newPasswordData.salt,
      newPasswordData.hash,
    );
  }
}
