import { EntityRepository, Repository } from 'typeorm';
import { ApiResponse } from '../domain/api-response.entity';

@EntityRepository(ApiResponse)
export class ApiResponseRepository extends Repository<ApiResponse> {}
