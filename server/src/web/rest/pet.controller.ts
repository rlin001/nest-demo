import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Logger,
    Param,
    Post as PostMethod,
    Put,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiUseTags } from '@nestjs/swagger';
import { PetDTO } from '../../service/dto/pet.dto';
import { PetService } from '../../service/pet.service';
import { AuthGuard, PetGuard, Roles, RolesGuard, RoleType } from '../../security';
import { HeaderUtil } from '../../client/header-util';
import { Request } from '../../client/request';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';
import { ApiResponseDTO } from '../../service/dto/api-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { generatePath, generateResp } from '../../utils';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';

@Controller('/api/pet')
@UseGuards(AuthGuard, RolesGuard)
@UseInterceptors(LoggingInterceptor, ClassSerializerInterceptor)
@ApiBearerAuth()
@ApiUseTags('pets')
export class PetController {
    logger = new Logger('PetController');

    constructor(private readonly petService: PetService) {}

    @PostMethod('/:id/uploadImage')
    @Roles(RoleType.USER)
    @UseGuards(PetGuard)
    @ApiOperation({ title: 'Uploads an image' })
    @ApiResponse({ status: 403, description: 'Forbidden or path is not exist' })
    @UseInterceptors(
        FileInterceptor('image', {
            // Check the mimetypes to allow for upload
            fileFilter: async (req: any, file: any, cb: any) => {
                if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
                    await cb(null, true);
                } else {
                    await cb(
                        new HttpException(`Unsupported file type ${file.originalname}`, HttpStatus.BAD_REQUEST),
                        false,
                    );
                }
            },
            storage: diskStorage({
                destination: (req: any, file: any, cb: any) => {
                    const uploadPath = generatePath(true, 'pet', req.params.id);
                    if (!existsSync(uploadPath)) {
                        mkdirSync(uploadPath);
                    }
                    cb(null, uploadPath);
                },
                filename: (req: any, file: any, cb: any) => {
                    const petId = req?.params?.id;
                    cb(null, `${petId || new Date()}-${file.originalname}`);
                },
            }),
        }),
    )
    async uploadImage(@Req() req: Request, @Param('id') id: number, @UploadedFile() file): Promise<ApiResponseDTO> {
        const pet = await this.petService.findById(id);

        let photoUrls = [generatePath(false, 'pet', id.toString(), file.filename).replace(/\\/g, '/')];
        if (pet.photoUrls) {
            photoUrls = photoUrls.concat(pet.photoUrls);
        }
        pet.photoUrls = photoUrls;
        const update = await this.petService.save(pet, req.user?.userName);
        return generateResp(!!update, 200, file);
    }

    @PostMethod('/')
    @Roles(RoleType.USER)
    @ApiOperation({ title: 'Add a new pet to the store' })
    @ApiResponse({
        status: 405,
        description: 'Invalid input.',
        type: PetDTO,
    })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    async post(@Req() req: Request, @Body() petDTO: PetDTO): Promise<PetDTO> {
        const created = await this.petService.save(petDTO, req.user?.userName);
        HeaderUtil.addEntityCreatedHeaders(req.res, 'Pet', created.id);
        return created;
    }

    @Put('/')
    @Roles(RoleType.USER)
    @ApiOperation({ title: 'Update pet' })
    @ApiResponse({
        status: 200,
        description: 'The record has been successfully updated.',
        type: PetDTO,
    })
    async put(@Req() req: Request, @Body() petDTO: PetDTO): Promise<PetDTO> {
        HeaderUtil.addEntityCreatedHeaders(req.res, 'Pet', petDTO.id);
        return await this.petService.update(petDTO, req.user?.userName);
    }

    @Get('/findByStatus')
    @Roles(RoleType.USER)
    @ApiResponse({
        status: 200,
        description: 'Finds pets by status',
        type: [PetDTO],
    })
    async findByStatus(@Body() body: Record<string, any>): Promise<PetDTO[]> {
        const petStatus = body.status;
        let whereObj = [{ status: petStatus }];
        if (Array.isArray(petStatus) && petStatus?.length) {
            whereObj = petStatus.map(status => ({ status }));
        }
        const results = await this.petService.find({
            where: whereObj,
        });
        return results;
    }

    @Get('/:id')
    @Roles(RoleType.USER)
    @ApiResponse({
        status: 200,
        description: 'Find by id',
        type: PetDTO,
    })
    async getOne(@Param('id') id: number): Promise<PetDTO | ApiResponseDTO> {
        const result = await this.petService.findById(id);
        if (result?.id) {
            return result;
        }
        const resp = new ApiResponseDTO();
        resp.code = 200;
        resp.message = 'no record';
        return resp;
    }

    @PostMethod('/:id')
    @Roles(RoleType.USER)
    @ApiOperation({ title: 'update pet by id' })
    @ApiResponse({
        status: 200,
        description: 'The record has been successfully updated.',
        type: PetDTO,
    })
    async putId(@Req() req: Request, @Body() petDTO: PetDTO): Promise<PetDTO> {
        HeaderUtil.addEntityCreatedHeaders(req.res, 'Pet', petDTO.id);
        return await this.petService.update(petDTO, req.user?.userName);
    }

    @Delete('/:id')
    @Roles(RoleType.USER)
    @ApiOperation({ title: 'Delete pet' })
    @ApiResponse({
        status: 204,
        description: 'The record has been successfully deleted.',
    })
    async deleteById(@Req() req: Request, @Param('id') id: number): Promise<ApiResponseDTO> {
        HeaderUtil.addEntityDeletedHeaders(req.res, 'Pet', id);
        await this.petService.deleteById(id);
        const resp = new ApiResponseDTO();
        resp.code = 200;
        resp.message = 'delete success';
        return resp;
    }
}
