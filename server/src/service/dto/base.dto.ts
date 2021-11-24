import {ApiModelProperty} from "@nestjs/swagger";

/**
 * A DTO base object.
 */
export class BaseDTO {

    @ApiModelProperty({description: 'id, should be number', required: false})
    id?: number;

    createdBy?: string;

    createdDate?: Date;

    lastModifiedBy?: string;

    lastModifiedDate?: Date;
}
