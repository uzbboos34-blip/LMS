import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private prisma : PrismaService,
    private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const host = context.switchToHttp();
      const req = host.getRequest();
      let token = req.headers.authorization;
      

      if (!token) {
        throw new UnauthorizedException('Token not found');
      }

      token = token.split(' ')[1];
      const user = await this.jwtService.verify(token);
      const userDB = await this.prisma.user.findUnique({
        where: {
          id: user.id,
          status: "ACTIVE"
        }
      })
      if (!userDB) {
        throw new UnauthorizedException('User not found');
      }

      req['user'] = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
