import { Module, Logger } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UserModule } from '@modules/user/user.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConstants } from './constants';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('auth.jwtKey') || jwtConstants.secret,
        signOptions: {
          expiresIn: config.get<string>('auth.jwtExpires') || '8h',
        },
      }),
    }),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, Logger, ConfigService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
