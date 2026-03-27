import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsString, IsOptional, IsMobilePhone, IsEnum, MaxLength, MinLength, IsBoolean } from 'class-validator';

export class CreateUserDto {
    @ApiProperty()
    @IsString()
    @IsMobilePhone('uz-UZ')
    phone: string;

    @ApiProperty()
    @IsString()
    @MinLength(6)
    password: string;
    
    @ApiProperty()
    @IsString()
    fullName: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    image?: string;
}
