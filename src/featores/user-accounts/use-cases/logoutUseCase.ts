import { JwtService } from '@nestjs/jwt';
import { UnauthorizedDomainException } from '../../../core/exceptions/domain-exceptions';
import { DevicesRepository } from '../infrastructure/devices.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class LogoutUseCommand {
  constructor(public token: string) {}
}

@CommandHandler(LogoutUseCommand)
export class LogoutUseCase implements ICommandHandler<LogoutUseCommand> {
  constructor(
    private jwtService: JwtService,
    private devisesRepository: DevicesRepository,
  ) {}

  async execute(command: LogoutUseCommand): Promise<void> {
    const cookieRefreshTokenObj = this.jwtService.verify(command.token);
    if (!cookieRefreshTokenObj) {
      throw UnauthorizedDomainException.create();
    }
    await this.devisesRepository.deleteDevice(cookieRefreshTokenObj.deviceId);
  }
}
