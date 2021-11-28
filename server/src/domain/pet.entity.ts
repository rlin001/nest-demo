/* eslint-disable @typescript-eslint/no-unused-vars */
import {Column, Entity, JoinTable, ManyToMany, ManyToOne} from 'typeorm';
import {BaseEntity} from './base/base.entity';


import {Category} from './category.entity';
import {Tag} from './tag.entity';
import {PetStatus} from './enumeration/pet-status';


/**
 * pet
 */
@Entity('pet')
export class Pet extends BaseEntity  {

    @Column({name: "name", nullable: true})
    name: string;

    @Column({type : "simple-array", nullable: true})
    photoUrls: string[];

    @Column({name: "inventory", nullable: false})
    inventory: number;

    @Column({type: 'simple-enum', name: 'status', enum: PetStatus})
    status: PetStatus;


    @ManyToOne(type => Category)
    @JoinTable({
      name: 'rel_pet_category',
      joinColumn: { name: 'pet_id', referencedColumnName: "id" },
      inverseJoinColumn: { name: 'category_id', referencedColumnName: "id" }
    })
    category: Category;

    @ManyToMany(type => Tag )
    @JoinTable({
        name: 'rel_pet_tag',
        joinColumn: { name: 'pet_id', referencedColumnName: "id" },
        inverseJoinColumn: { name: 'tag_id', referencedColumnName: "id" }
    })
    tags: Tag[];

    // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove

}
