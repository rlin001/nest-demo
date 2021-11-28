import { Request as ExpressRequest } from 'express';
import { UserDTO } from '../service/dto/user.dto';
import {PetDTO} from "../service/dto/pet.dto";

export interface Request extends ExpressRequest {
    user?: UserDTO;
    pet?: PetDTO;
}
