/* eslint-disable @typescript-eslint/no-unused-vars */
import { Entity, Column, JoinColumn, OneToOne, ManyToOne, OneToMany, ManyToMany, JoinTable} from 'typeorm';
import { BaseEntity } from './base/base.entity';


import { Pet } from './pet.entity';
import { OrderStatus } from './enumeration/order-status';


/**
 * order
 */
@Entity('jhi_order')
export class Order extends BaseEntity  {

    @Column({type: 'integer' ,name: "quantity", nullable: true})
    quantity: number;

    @Column({type: 'datetime' ,name: "ship_date", nullable: true})
    shipDate: any;

    @Column({type: 'simple-enum', name: 'status', enum: OrderStatus})
    status: OrderStatus;


    @ManyToOne(type => Pet)
    petId: Pet;

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove

}
