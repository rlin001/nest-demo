import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class PetGuard implements CanActivate {
    constructor(@Inject('PetService') private readonly petService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req: Request = context.switchToHttp().getRequest();
        const pet = await this.petService.findById(req?.params?.id || '');
        return pet;
    }
}
