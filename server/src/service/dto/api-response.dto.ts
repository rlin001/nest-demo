/* eslint-disable @typescript-eslint/no-unused-vars */
import { ApiModelProperty } from '@nestjs/swagger';
import { BaseDTO } from './base.dto';




/**
 * A ApiResponseDTO object.
 */
export class ApiResponseDTO {

        code: number;

        type: string;

        message: string;


        // jhipster-needle-entity-add-field - JHipster will add fields here, do not remove

    }
