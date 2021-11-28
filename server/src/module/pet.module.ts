import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {PetController} from '../web/rest/pet.controller';
import {PetRepository} from '../repository/pet.repository';
import {PetService} from '../service/pet.service';
import {TagService} from "../service/tag.service";
import {CategoryService} from "../service/category.service";
import {CategoryRepository} from "../repository/category.repository";
import {TagRepository} from "../repository/tag.repository";
import { MulterModule } from '@nestjs/platform-express';
import {join} from "path";


@Module({
  imports: [
    TypeOrmModule.forFeature([PetRepository]),
    TypeOrmModule.forFeature([CategoryRepository]),
    TypeOrmModule.forFeature([TagRepository]),
    MulterModule.register({
      dest: join(__dirname, '..', '..', 'public', 'images', 'pet'),
    })
  ],
  controllers: [PetController],
  providers: [PetService, TagService, CategoryService],
  exports: [PetService],
})
export class PetModule {}
