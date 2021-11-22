/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import {Request, Response} from 'express';
import {AuthGuard, Roles, RolesGuard, RoleType} from '../../security';
import {UserDTO} from '../../service/dto/user.dto';
import {LoggingInterceptor} from '../../client/interceptors/logging.interceptor';
import {ApiBearerAuth, ApiExcludeEndpoint, ApiOperation, ApiResponse, ApiUseTags} from '@nestjs/swagger';
import {AuthService} from '../../service/auth.service';
import {UserLoginDTO} from "../../service/dto/user-login.dto";
import {Page, PageRequest} from "../../domain/base/pagination.entity";
import {HeaderUtil} from "../../client/header-util";
import {UserService} from "../../service/user.service";
import {Request as UserRequest} from '../../client/request';

@Controller('/user')
@UseInterceptors(LoggingInterceptor)
@ApiUseTags('User')
export class AccountController {
    logger = new Logger('AccountController');

    constructor(
      private readonly authService: AuthService,
      private readonly userService: UserService,
    ) {}

    @Post('/createWithList')
    @Roles(RoleType.ADMIN)
    @UseGuards(AuthGuard, RolesGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiBearerAuth()
    @ApiOperation({ title: 'Creates list of users with given input array' })
    @ApiResponse({
      status: 201,
      description: 'The record has been successfully created.',
      type: [UserDTO],
    })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async createUsersWithList(@Req() req: UserRequest, @Body() userDTOs: UserDTO[]): Promise<UserDTO[]> {

      if (!userDTOs?.length) {
        return null;
      }
      userDTOs.map((userDTO)=>{
        userDTO.password = userDTO.userName;
        return userDTO;
      })
      const createds = await this.userService.saveList(userDTOs, req.user?.userName, true);
      const createdIds = createds.map((created)=>  created.id)
      HeaderUtil.addEntityCreatedHeaders(req.res, 'Users', createdIds.join(','));
      return createds;
    }

    @Get('/:userName')
    @Roles(RoleType.ADMIN, RoleType.USER)
    @UseGuards(AuthGuard, RolesGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiBearerAuth()
    @ApiOperation({ title: 'Get user by user name' })
    @ApiResponse({
      status: 200,
      description: 'The found record',
      type: UserDTO,
    })
    async getUser(@Param('userName') loginValue: string): Promise<UserDTO> {
      return await this.userService.find({ where: { userName: loginValue } });
    }

    @Put('/:userName')
    @UseGuards(AuthGuard, RolesGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiBearerAuth()
    @Roles(RoleType.ADMIN, RoleType.USER)
    @ApiOperation({ title: 'Update user', description: 'This can only be done by the logged in user.'})
    @ApiResponse({
      status: 200,
      description: 'The record has been successfully updated.',
      type: UserDTO,
    })
    async updateUser(@Param('userName') loginValue: string, @Req() req: UserRequest, @Body() userDTO: UserDTO): Promise<UserDTO> {
      const userOnDb = await this.userService.find({ where: { userName: userDTO.userName } });
      let updated = false;
      if (userOnDb && userOnDb.id) {
        userDTO.id = userOnDb.id;
        updated = true;
      } else {
        userDTO.password = userDTO.userName;
      }
      const createdOrUpdated = await this.userService.update(userDTO, req.user?.userName);
      if (updated) {
        HeaderUtil.addEntityUpdatedHeaders(req.res, 'User', createdOrUpdated.id);
      } else {
        HeaderUtil.addEntityCreatedHeaders(req.res, 'User', createdOrUpdated.id);
      }
      return createdOrUpdated;
    }

    @Delete('/:userName')
    @Roles(RoleType.ADMIN)
    @UseGuards(AuthGuard, RolesGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiBearerAuth()
    @ApiOperation({ title: 'Delete user' })
    @ApiResponse({
      status: 204,
      description: 'The record has been successfully deleted.',
      type: UserDTO,
    })
    async deleteUser(@Req() req: UserRequest, @Param('userName') loginValue: string): Promise<UserDTO> {
      HeaderUtil.addEntityDeletedHeaders(req.res, 'User', loginValue);
      const userToDelete = await this.userService.find({ where: { userName: loginValue } });
      return await this.userService.delete(userToDelete);
    }

    @Post('/rest/login')
    @ApiOperation({ title: 'Logs user into the system' })
    @ApiResponse({
      status: 201,
      description: 'Authorized',
    })
    async login(@Req() req: Request, @Body() user: UserLoginDTO, @Res() res: Response): Promise<any> {
      const jwt = await this.authService.login(user);
      const authorization = `Bearer ${jwt.id_token}`;
      res.setHeader('Authorization', authorization);
      return res.json(jwt);
    }

    @Get('/rest/logout')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ title: 'Get the list of users' })
    @ApiResponse({
      status: 200,
      description: 'logout success',
    })
    async logout(@Req() req: Request, @Res() res: Response): Promise<any> {
      this.logger.log("logout ", req.headers.authorization)
      const result = await this.authService.logout(req);
      return res.json({
        status: result ? 200 : 500,
        description: result ? 'logout success': 'logout failed',
      });
    }

  /*@Get('/')
  @Roles(RoleType.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBearerAuth()
  @ApiOperation({ title: 'Get the list of users' })
  @ApiResponse({
    status: 200,
    description: 'List all users',
    type: UserDTO,
  })
  @ApiExcludeEndpoint()
  async getAllUsers(@Req() req: UserRequest): Promise<UserDTO[]> {
    const sortField = req.query.sort;
    const pageRequest: PageRequest = new PageRequest(req.query.page, req.query.size, sortField);
    const [results, count] = await this.userService.findAndCount({
      skip: +pageRequest.page * pageRequest.size,
      take: +pageRequest.size,
      order: pageRequest.sort.asOrder(),
    });
    HeaderUtil.addPaginationHeaders(req.res, new Page(results, count, pageRequest));
    return results;
  }*/



  @Post('/createWithArray')
  @Roles(RoleType.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBearerAuth()
  @ApiOperation({ title: 'Creates list of users with given input array' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: [UserDTO],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async createUsersWithArray(@Req() req: UserRequest, @Body() userDTOs: UserDTO[]): Promise<UserDTO[]> {

    if (!userDTOs?.length) {
      return null;
    }
    userDTOs.map((userDTO)=>{
      userDTO.password = userDTO.userName;
      return userDTO;
    })
    const createds = await this.userService.saveList(userDTOs, req.user?.userName, true);
    const createdIds = createds.map((created)=>  created.id)
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Users', createdIds.join(','));
    return createds;
  }

  @Post('/')
  @Roles(RoleType.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiBearerAuth()
  @ApiOperation({ title: 'Create user' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: UserDTO,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async createUser(@Req() req: UserRequest, @Body() userDTO: UserDTO): Promise<UserDTO> {
    userDTO.password = userDTO.userName;
    const created = await this.userService.save(userDTO, req.user?.userName, true);
    HeaderUtil.addEntityCreatedHeaders(req.res, 'User', created.id);
    return created;
  }
}
