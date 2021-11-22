import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Logger, Param, Post as PostMethod, Put, UseGuards, Req, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiUseTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { OrderDTO } from '../../service/dto/order.dto';
import { OrderService } from '../../service/order.service';
import { PageRequest, Page } from '../../domain/base/pagination.entity';
import { AuthGuard,  Roles, RolesGuard, RoleType } from '../../security';
import { HeaderUtil } from '../../client/header-util';
import { Request } from '../../client/request';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';


@Controller('store')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth()
@ApiUseTags('orders')
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
  async getInventory(@Req() req: Request, @Body() orderDTO: OrderDTO): Promise<OrderDTO>  {
    const created = await this.orderService.save(orderDTO, req.user?.userName);
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Order', created.id);
    return created;
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
  async createOrder(@Req() req: Request, @Body() orderDTO: OrderDTO): Promise<OrderDTO>  {
    const created = await this.orderService.save(orderDTO, req.user?.userName);
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Order', created.id);
    return created;
  }

  @Get('/order/:id')
  @Roles(RoleType.USER)
  @ApiResponse({
    status: 200,
    description: 'Find order by id',
    type: OrderDTO,
  })
  async getOrderById(@Param('id') id: number): Promise<OrderDTO>  {
    return await this.orderService.findById(id);
  }

  @Delete('/:id')
  @Roles(RoleType.ADMIN)
  @ApiOperation({ title: 'Delete order' })
  @ApiResponse({
    status: 204,
    description: 'The record has been successfully deleted.',
  })
  async deleteById(@Req() req: Request, @Param('id') id: number): Promise<void>  {
    HeaderUtil.addEntityDeletedHeaders(req.res, 'Order', id);
    return await this.orderService.deleteById(id);
  }
}
