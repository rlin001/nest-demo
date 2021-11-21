import {ClassSerializerInterceptor, Controller, Logger, UseGuards, UseInterceptors,} from '@nestjs/common';
import {AuthGuard, RolesGuard} from '../../security';
import {LoggingInterceptor} from '../../client/interceptors/logging.interceptor';
import {ApiBearerAuth, ApiUseTags} from '@nestjs/swagger';
import {UserService} from '../../service/user.service';

@Controller('api/admin/users')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth()
@ApiUseTags('user-resource')
export class UserController {
    logger = new Logger('UserController');

    constructor(private readonly userService: UserService) {}
}
