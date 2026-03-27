import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class isPrimaryAdminDto {
    @ApiProperty({
        example: true,
    })
    @IsBoolean()
    isPrimaryAdmin: boolean
}
