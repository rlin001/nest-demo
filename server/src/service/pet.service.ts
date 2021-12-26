import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { PetDTO } from './dto/pet.dto';
import { PetMapper } from './mapper/pet.mapper';
import { PetRepository } from '../repository/pet.repository';
import { CategoryService } from './category.service';
import { TagService } from './tag.service';
import { CategoryMapper } from './mapper/category.mapper';
import { TagMapper } from './mapper/tag.mapper';
import { Pet } from '../domain/pet.entity';

const relationshipNames = [];
relationshipNames.push('category');
relationshipNames.push('tags');

@Injectable()
export class PetService {
    logger = new Logger('PetService');

    constructor(
        @InjectRepository(PetRepository) private petRepository: PetRepository,
        private readonly tagService: TagService,
        private readonly categoryService: CategoryService,
    ) {}

    async findById(id: number): Promise<PetDTO | undefined> {
        const options = { relations: relationshipNames };
        const result = await this.petRepository.findOne(id, options);
        return PetMapper.fromEntityToDTO(result);
    }

    async checkInventory(id: number, quantity: number): Promise<boolean | undefined> {
        const options = { relations: relationshipNames };
        const result = await this.petRepository.findOne(id, options);
        const hasStock = result?.inventory && result.inventory > quantity;
        return hasStock;
    }

    async updateInventory(id: number, quantity: number, creator?: string): Promise<PetDTO | undefined> {
        const options = { relations: relationshipNames };
        const result = await this.petRepository.findOne(id, options);
        result.inventory -= quantity;
        if (creator) {
            result.lastModifiedBy = creator;
        }
        const updateResult = await this.petRepository.save(result);
        return PetMapper.fromEntityToDTO(updateResult);
    }

    async find(options: FindManyOptions<PetDTO>): Promise<PetDTO[] | undefined> {
        const results = await this.petRepository.find(options);
        if (results?.length) {
            return results.map(result => PetMapper.fromEntityToDTO(result));
        }
        return [];
    }

    async findByFields(options: FindOneOptions<PetDTO>): Promise<PetDTO | undefined> {
        const result = await this.petRepository.findOne(options);
        return PetMapper.fromEntityToDTO(result);
    }

    async findAndCount(options?: FindManyOptions<PetDTO>): Promise<[PetDTO[], number]> {
        if (options) {
            options.relations = relationshipNames;
        } else {
            options = { relations: relationshipNames };
        }
        const resultList = await this.petRepository.findAndCount(options);
        const petsDTO: PetDTO[] = [];
        if (resultList && resultList[0]) {
            resultList[0].forEach(pet => petsDTO.push(PetMapper.fromEntityToDTO(pet)));
        }
        return [petsDTO, resultList[1]];
    }

    async save(petDTO: PetDTO, creator?: string): Promise<PetDTO | undefined> {
        const entity = PetMapper.fromDTOtoEntity(petDTO);
        if (creator) {
            if (!entity.createdBy) {
                entity.createdBy = creator;
            }
            entity.lastModifiedBy = creator;
            entity.inventory = 100;
        }
        await this.checkRelateUpdate(entity, creator);
        const result = await this.petRepository.save(entity);
        return PetMapper.fromEntityToDTO(result);
    }

    async checkRelateUpdate(pet: Pet, creator?: string): Promise<void> {
        // for tags and category
        if (pet?.tags?.length) {
            await this.tagService.saveOrUpdateList(
                pet.tags.map(tag => TagMapper.fromEntityToDTO(tag)),
                creator,
            );
        }
        if (pet?.category?.id) {
            await this.categoryService.save(CategoryMapper.fromEntityToDTO(pet.category), creator);
        }
    }

    async update(petDTO: PetDTO, updater?: string): Promise<PetDTO | undefined> {
        const entity = PetMapper.fromDTOtoEntity(petDTO);
        if (updater) {
            entity.lastModifiedBy = updater;
        }
        await this.checkRelateUpdate(entity, updater);
        const result = await this.petRepository.save(entity);
        return PetMapper.fromEntityToDTO(result);
    }

    async deleteById(id: number): Promise<void | undefined> {
        await this.petRepository.delete(id);
        const entityFind = await this.findById(id);
        if (entityFind) {
            throw new HttpException('Error, entity not deleted!', HttpStatus.NOT_FOUND);
        }
        return;
    }
}
