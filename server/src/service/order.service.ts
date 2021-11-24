import {HttpException, HttpStatus, Injectable, Logger} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {OrderDTO} from '../service/dto/order.dto';
import {OrderMapper} from '../service/mapper/order.mapper';
import {OrderRepository} from '../repository/order.repository';
import {PetService} from "./pet.service";
import {ApiResponseDTO} from "./dto/api-response.dto";
import {generateResp} from "../utils";
import {FindManyOptions} from "typeorm";
import {UserDTO} from "./dto/user.dto";
import {CategoryDTO} from "./dto/category.dto";
import {CategoryMapper} from "./mapper/category.mapper";
import {Order} from "../domain/order.entity";
import {PetDTO} from "./dto/pet.dto";
import {PetMapper} from "./mapper/pet.mapper";

const relationshipNames = [];
    relationshipNames.push('petId');


@Injectable()
export class OrderService {
    logger = new Logger('OrderService');

    constructor(
      @InjectRepository(OrderRepository) private orderRepository: OrderRepository,
      private petService: PetService,
    ) {}

      async findById(id: number): Promise<OrderDTO | undefined> {
        const options = { relations: relationshipNames };
        const result = await this.orderRepository.findOne(id, options);
        return OrderMapper.fromEntityToDTO(result);
      }

      async findAllOrderAndPet(options?: FindManyOptions<Order>): Promise<[OrderDTO[], PetDTO[]]> {
        if (options) {
          options.relations = relationshipNames;
        } else {
          options = {relations: relationshipNames}
        }
        const resultList = await this.orderRepository.findAndCount(options)
        const petResultList = await this.petService.findAndCount();

        const orderDTOs: OrderDTO[] = [];
        if (resultList && resultList[0]) {
          resultList[0].forEach(order => orderDTOs.push(OrderMapper.fromEntityToDTO(order)));
        }
        return [orderDTOs, petResultList[0]];
      }

      async save(orderDTO: OrderDTO, creator?: string): Promise<OrderDTO | ApiResponseDTO | undefined> {
        const entity = OrderMapper.fromDTOtoEntity(orderDTO);
        if (creator) {
            if (!entity.createdBy) {
                entity.createdBy = creator;
            }
            entity.lastModifiedBy = creator;
        }
        const executeStatus = await this.petService.checkInventory(Number(orderDTO.petId), orderDTO.quantity);
        if (executeStatus) {
          const result = await this.orderRepository.save(entity);
          await this.petService.updateInventory(Number(orderDTO.petId), orderDTO.quantity)
          return OrderMapper.fromEntityToDTO(result);
        }
        return generateResp(false, 200, 'current pet hasn\'t enough stock');
      }

      async update(orderDTO: OrderDTO, updater?: string): Promise<OrderDTO | undefined> {
        const entity = OrderMapper.fromDTOtoEntity(orderDTO);
        if (updater) {
            entity.lastModifiedBy = updater;
        }
        const result = await this.orderRepository.save(entity);
        return OrderMapper.fromEntityToDTO(result);
      }

      async deleteById(id: number): Promise<void | undefined> {
        await this.orderRepository.delete(id);
        const entityFind = await this.findById(id);
        if (entityFind) {
          throw new HttpException('Error, entity not deleted!', HttpStatus.NOT_FOUND);
        }
        return;
      }

}
