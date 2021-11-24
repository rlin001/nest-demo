/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Entity,
  Column,
  JoinColumn,
  OneToOne,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  PrimaryColumn, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn
} from 'typeorm';
import { BaseEntity } from './base/base.entity';


import { Pet } from './pet.entity';
import { OrderStatus } from './enumeration/order-status';


/**
 * order
 */
@Entity('jhi_order')
export class Order  {

    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ nullable: true })
    createdBy?: string;
    @CreateDateColumn({ nullable: true })
    createdDate?: Date;
    @Column({ nullable: true })
    lastModifiedBy?: string;
    @UpdateDateColumn({ nullable: true })
    lastModifiedDate?: Date;

    @Column({type: 'integer' ,name: "quantity", nullable: true})
    quantity: number;

    @Column({type: 'datetime' ,name: "ship_date", nullable: true, default: (new Date()).toDateString()})
    shipDate: any;

    @Column({type: 'simple-enum', name: 'status', enum: OrderStatus})
    status: OrderStatus;


    @ManyToOne(type => Pet)
    petId: Pet;

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove

}
