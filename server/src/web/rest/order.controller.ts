import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Logger, Param, Post as PostMethod, Put, UseGuards, Req, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiUseTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { OrderDTO } from '../../service/dto/order.dto';
import { OrderService } from '../../service/order.service';
import { PageRequest, Page } from '../../domain/base/pagination.entity';
import { AuthGuard,  Roles, RolesGuard, RoleType } from '../../security';
import { HeaderUtil } from '../../client/header-util';
import { Request } from '../../client/request';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';
import {ApiResponseDTO} from "../../service/dto/api-response.dto";
import {generateResp} from "../../utils";


@Controller('store')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth()
@ApiUseTags('Store')
export class OrderController {
  logger = new Logger('OrderController');

  constructor(private readonly orderService: OrderService) {}


  @Get('/inventory')
  @Roles(RoleType.USER)
  @ApiOperation({ title: 'return pet inventory by status' })
  @ApiResponse({
    status: 201,
    description: 'create a order with pet.',
    type: OrderDTO,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async getInventory(@Req() req: Request, @Body() orderDTO: OrderDTO): Promise<Object | ApiResponseDTO>  {
    const created = await this.orderService.save(orderDTO, req.user?.userName);
    const resp = {
      SOLD:0,
      PENDING:0,
      AVAILABLE: 0
    };
    // order status
    const results = await this.orderService.findAllOrderAndPet();
    const orderDTOs = results[0] || [];
    const petDTOs = results[1] || [];
    petDTOs.map((petDTO)=>{
      switch (petDTO.status) {
        case 'AVAILABLE':
          resp.AVAILABLE += (petDTO.inventory || 0);
        case 'PENDING':
          resp.PENDING += (petDTO.inventory || 0);
      }
    });
    orderDTOs.map((orderDTO)=>{
      resp.SOLD += (orderDTO.quantity || 1)
    })
    return resp;
  }

  @PostMethod('/order')
  @Roles(RoleType.USER)
  @ApiOperation({ title: 'Create order' })
  @ApiResponse({
    status: 201,
    description: 'create a order with pet.',
    type: OrderDTO,
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async createOrder(@Req() req: Request, @Body() orderDTO: OrderDTO): Promise<OrderDTO | ApiResponseDTO>  {
    if (!orderDTO?.quantity) {
      return generateResp(false, 200, 'the parameter has some error, please check again');
    }
    const created = await this.orderService.save(orderDTO, req.user?.userName);
    return created;
  }

  @Get('/order/:id')
  @Roles(RoleType.USER)
  @ApiResponse({
    status: 200,
    description: 'Find order by id',
    type: OrderDTO,
  })
  async getOrderById(@Param('id') id: number): Promise<OrderDTO | ApiResponseDTO>  {
    const result = await this.orderService.findById(id);
    if (result) {
      return result;
    }
    return generateResp(true, 200, 'no data');
  }

  @Delete('/order/:id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ title: 'Delete order' })
  @ApiResponse({
    status: 204,
    description: 'The record has been successfully deleted.',
  })
  async deleteById(@Req() req: Request, @Param('id') id: number): Promise<ApiResponseDTO>  {
    HeaderUtil.addEntityDeletedHeaders(req.res, 'Order', id);
    await this.orderService.deleteById(id);
    return generateResp(true, 200, 'remove success');
  }
}
