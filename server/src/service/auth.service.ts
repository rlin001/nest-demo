import {HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {JwtService} from '@nestjs/jwt';
import {UserLoginDTO} from './dto/user-login.dto';
import {Payload} from '../security/payload.interface';
import * as bcrypt from 'bcrypt';
import {AuthorityRepository} from '../repository/authority.repository';
import {UserService} from './user.service';
import {UserDTO} from './dto/user.dto';
import {FindManyOptions} from 'typeorm';
import {CacheService} from "./cache.service";
import {Request} from "express";

@Injectable()
export class AuthService {
    logger = new Logger('AuthService');
    constructor(
        private readonly jwtService: JwtService,
        @InjectRepository(AuthorityRepository) private authorityRepository: AuthorityRepository,
        private userService: UserService,
        private cacheService: CacheService,
    ) {}

    async login(userLogin: UserLoginDTO): Promise<any> {
        const loginUserName = userLogin.username;
        const loginPassword = userLogin.password;

        const userFind = await this.userService.findByFields({ where: { userName: loginUserName } });
        const validPassword = !!userFind && (await bcrypt.compare(loginPassword, userFind.password));
        if (!userFind || !validPassword) {
            throw new HttpException('Invalid user name or password!', HttpStatus.BAD_REQUEST);
        }

        if (userFind && !userFind.activated) {
            throw new HttpException('Your account is not been activated!', HttpStatus.BAD_REQUEST);
        }

        const user = await this.findUserWithAuthById(userFind.id);

        const payload: Payload = { id: user.id, username: user.userName, authorities: user.authorities };

        /* eslint-disable */
      const result = {
        id_token: this.jwtService.sign(payload)
      };
      const authorization = `Bearer ${result.id_token}`;
      await this.cacheService.handleJWTToken("authorization", authorization, 'add');

      return result;
  }

  async logout(req: Request): Promise<any> {
    const result = await this.cacheService.handleJWTToken("authorization", req.headers.authorization, 'delete');
    return result;
  }

  /* eslint-enable */
    async validateUser(payload: Payload): Promise<UserDTO | undefined> {
        return await this.findUserWithAuthById(payload.id);
    }

    async findUserWithAuthById(userId: number): Promise<UserDTO | undefined> {
        const userDTO: UserDTO = await this.userService.findByFields({ where: { id: userId } });
        return userDTO;
    }

    async getAccount(userId: number): Promise<UserDTO | undefined> {
        const userDTO: UserDTO = await this.findUserWithAuthById(userId);
        if (!userDTO) {
            return;
        }
        return userDTO;
    }

    async changePassword(userLogin: string, currentClearTextPassword: string, newPassword: string): Promise<void> {
        const userFind: UserDTO = await this.userService.findByFields({ where: { userName: userLogin } });
        if (!userFind) {
            throw new HttpException('Invalid user name!', HttpStatus.BAD_REQUEST);
        }

        if (!(await bcrypt.compare(currentClearTextPassword, userFind.password))) {
            throw new HttpException('Invalid password!', HttpStatus.BAD_REQUEST);
        }
        userFind.password = newPassword;
        await this.userService.save(userFind, userLogin, true);
        return;
    }

    async registerNewUser(newUser: UserDTO): Promise<UserDTO> {
        let userFind: UserDTO = await this.userService.findByFields({ where: { userName: newUser.userName } });
        if (userFind) {
            throw new HttpException('Login name already used!', HttpStatus.BAD_REQUEST);
        }
        userFind = await this.userService.findByFields({ where: { email: newUser.email } });
        if (userFind) {
            throw new HttpException('Email is already in use!', HttpStatus.BAD_REQUEST);
        }
        newUser.authorities = ['ROLE_USER'];
        const user: UserDTO = await this.userService.save(newUser, newUser.userName, true);
        return user;
    }

    async updateUserSettings(userLogin: string, newUserInfo: UserDTO): Promise<UserDTO> {
        const userFind: UserDTO = await this.userService.findByFields({ where: { userName: userLogin } });
        if (!userFind) {
            throw new HttpException('Invalid user name!', HttpStatus.BAD_REQUEST);
        }
        const userFindEmail: UserDTO = await this.userService.findByFields({ where: { email: newUserInfo.email } });
        if (userFindEmail && newUserInfo.email !== userFind.email) {
            throw new HttpException('Email is already in use!', HttpStatus.BAD_REQUEST);
        }

        userFind.firstName = newUserInfo.firstName;
        userFind.lastName = newUserInfo.lastName;
        userFind.email = newUserInfo.email;
        userFind.langKey = newUserInfo.langKey;
        await this.userService.save(userFind, userLogin);
        return;
    }

    async getAllUsers(options: FindManyOptions<UserDTO>): Promise<[UserDTO[], number]> {
        return await this.userService.findAndCount(options);
    }
}
