import { UserContextDto } from '../guards/dto/user-context.dto';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedDomainException } from '../../../core/exceptions/domain-exceptions';
import { DevicesRepository } from '../infrastructure/devices.repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class RefreshTokenCommand {
  constructor(
    public ip: string,
    public token: string,
  ) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    private jwtService: JwtService,
    private devisesRepository: DevicesRepository,
  ) {}

  async execute(
    command: RefreshTokenCommand,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const cookieRefreshTokenObj = this.jwtService.verify(command.token);
    if (!cookieRefreshTokenObj) {
      throw UnauthorizedDomainException.create();
    }
    const deviceId = cookieRefreshTokenObj.deviceId;
    const userId = cookieRefreshTokenObj.id;
    const newAccessToken = this.jwtService.sign(
      { id: userId, deviceId } as UserContextDto,
      {
        expiresIn: '10s',
      },
    );
    const newRefreshToken = this.jwtService.sign(
      { id: userId, deviceId } as UserContextDto,
      { expiresIn: '20s' },
    );
    const newRefreshTokenObj = this.jwtService.verify(newRefreshToken);
    const newIssuedAt = newRefreshTokenObj.iat;
    await this.devisesRepository.updateDevise(
      command.ip,
      deviceId,
      newIssuedAt,
    );
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
