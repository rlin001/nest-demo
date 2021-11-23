import {Module} from '@nestjs/common';
import {AuthService} from '../service/auth.service';
import {UserModule} from './user.module';
import {PassportModule} from '@nestjs/passport';
import {JwtModule} from '@nestjs/jwt';
import {JwtStrategy} from '../security/passport.jwt.strategy';
import {config} from '../config';
import {TypeOrmModule} from '@nestjs/typeorm';
import {AuthorityRepository} from '../repository/authority.repository';

import {AccountController} from '../web/rest/account.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([AuthorityRepository]),
        UserModule,
        PassportModule,
        JwtModule.register({
            secret: config['jhipster.security.authentication.jwt.base64-secret'],
            signOptions: { expiresIn: '300s' },
        }),
    ],
    controllers: [AccountController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule {}
