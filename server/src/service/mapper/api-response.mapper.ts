import { ApiResponse } from '../../domain/api-response.entity';
import { ApiResponseDTO } from '../dto/api-response.dto';


/**
 * A ApiResponse mapper object.
 */
export class ApiResponseMapper {

  static fromDTOtoEntity (entityDTO: ApiResponseDTO): ApiResponse {
    if (!entityDTO) {
      return;
    }
    let entity = new ApiResponse();
    const fields = Object.getOwnPropertyNames(entityDTO);
    fields.forEach(field => {
        entity[field] = entityDTO[field];
    });
    return entity;

  }

  static fromEntityToDTO (entity: ApiResponse): ApiResponseDTO {
    if (!entity) {
      return;
    }
    let entityDTO = new ApiResponseDTO();

    const fields = Object.getOwnPropertyNames(entity);

    fields.forEach(field => {
        entityDTO[field] = entity[field];
    });

    return entityDTO;
  }
}
