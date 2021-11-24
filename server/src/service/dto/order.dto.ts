/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiModelProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength, MaxLength, Length, Min, Max, Matches } from 'class-validator';
import { BaseDTO } from './base.dto';


import { PetDTO } from './pet.dto';
import { OrderStatus } from '../../domain/enumeration/order-status';


/**
 * A OrderDTO object.
 */
export class OrderDTO {


        @ApiModelProperty({description: 'id, should be number', required: false})
        id?: number;

        createdBy?: string;

        createdDate?: Date;

        lastModifiedBy?: string;

        lastModifiedDate?: Date;

        @ApiModelProperty({description: 'quantity field', required: false})
        quantity: number;

        @ApiModelProperty({description: 'shipDate field', required: false})
        shipDate: any;

        @ApiModelProperty({ enum: OrderStatus,description: 'status enum field', required: false})
        status: OrderStatus;

        @ApiModelProperty({ description: 'petId'})
        petId: string;

        @ApiModelProperty({ description: 'order complete'})
        complete: boolean;

        // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove

    }
