import {Controller, Logger,} from '@nestjs/common';

@Controller()
export class UserController {
    logger = new Logger('UserController');
}
