import {PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, PrimaryColumn} from 'typeorm';

export abstract class BaseEntity {
    // @PrimaryGeneratedColumn()
    @PrimaryColumn()
    id?: number;

    @Column({ nullable: true })
    createdBy?: string;
    @CreateDateColumn({ nullable: true })
    createdDate?: Date;
    @Column({ nullable: true })
    lastModifiedBy?: string;
    @UpdateDateColumn({ nullable: true })
    lastModifiedDate?: Date;
}
