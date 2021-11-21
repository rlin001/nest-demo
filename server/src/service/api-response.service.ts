import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOneOptions } from 'typeorm';
import { ApiResponseDTO }  from '../service/dto/api-response.dto';
import { ApiResponseMapper }  from '../service/mapper/api-response.mapper';
import { ApiResponseRepository } from '../repository/api-response.repository';

const relationshipNames = [];


@Injectable()
export class ApiResponseService {
    logger = new Logger('ApiResponseService');

    constructor(@InjectRepository(ApiResponseRepository) private apiResponseRepository: ApiResponseRepository) {}

      async findById(id: number): Promise<ApiResponseDTO | undefined> {
        const options = { relations: relationshipNames };
        const result = await this.apiResponseRepository.findOne(id, options);
        return ApiResponseMapper.fromEntityToDTO(result);
      }

      async findByFields(options: FindOneOptions<ApiResponseDTO>): Promise<ApiResponseDTO | undefined> {
        const result = await this.apiResponseRepository.findOne(options);
        return ApiResponseMapper.fromEntityToDTO(result);
      }

      async findAndCount(options: FindManyOptions<ApiResponseDTO>): Promise<[ApiResponseDTO[], number]> {
        options.relations = relationshipNames;
        const resultList = await this.apiResponseRepository.findAndCount(options);
        const apiResponseDTO: ApiResponseDTO[] = [];
        if (resultList && resultList[0]) {
            resultList[0].forEach(apiResponse => apiResponseDTO.push(ApiResponseMapper.fromEntityToDTO(apiResponse)));
            resultList[0] = apiResponseDTO;
        }
        return resultList;
      }

      async save(apiResponseDTO: ApiResponseDTO, creator?: string): Promise<ApiResponseDTO | undefined> {
        const entity = ApiResponseMapper.fromDTOtoEntity(apiResponseDTO);
        if (creator) {
            if (!entity.createdBy) {
                entity.createdBy = creator;
            }
            entity.lastModifiedBy = creator;
        }
        const result = await this.apiResponseRepository.save(entity);
        return ApiResponseMapper.fromEntityToDTO(result);
      }

      async update(apiResponseDTO: ApiResponseDTO, updater?: string): Promise<ApiResponseDTO | undefined> {
        const entity = ApiResponseMapper.fromDTOtoEntity(apiResponseDTO);
        if (updater) {
            entity.lastModifiedBy = updater;
        }
        const result = await this.apiResponseRepository.save(entity);
        return ApiResponseMapper.fromEntityToDTO(result);
      }

      async deleteById(id: number): Promise<void | undefined> {
        await this.apiResponseRepository.delete(id);
        const entityFind = await this.findById(id);
        if (entityFind) {
          throw new HttpException('Error, entity not deleted!', HttpStatus.NOT_FOUND);
        }
        return;
      }

}
