import { UserContextDto } from '../guards/dto/user-context.dto';
import { loginDto } from '../dto/login.user.dto';
import { v4 as uuidv4 } from 'uuid';
import { JwtService } from '@nestjs/jwt';
import { DevicesService } from '../application/devices.service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class LoginUseCommand {
  constructor(
    public dto: loginDto,
    public deviceId: string = uuidv4(),
  ) {}
}

@CommandHandler(LoginUseCommand)
export class LoginUseCase implements ICommandHandler<LoginUseCommand> {
  constructor(
    private jwtService: JwtService,
    private devicesService: DevicesService,
  ) {}
  async execute(command: LoginUseCommand) {
    const accessToken = this.jwtService.sign(
      { id: command.dto.userId, deviceId: command.deviceId } as UserContextDto,
      {
        expiresIn: '10s',
      },
    );
    const refreshToken = this.jwtService.sign(
      { id: command.dto.userId, deviceId: command.deviceId } as UserContextDto,
      { expiresIn: '20s' },
    );

    const deviceDto = {
      newRefreshToken: refreshToken,
      ip: command.dto.ip,
      userAgent: command.dto.userAgent,
    };
    await this.devicesService.createDevice(deviceDto);
    return {
      accessToken,
      refreshToken,
    };
  }
}
