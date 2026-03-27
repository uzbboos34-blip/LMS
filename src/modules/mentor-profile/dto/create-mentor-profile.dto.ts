import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional } from 'class-validator';

export class CreateMentorProfileDto {
    @ApiProperty()
    @IsString()
    about: string;
    
    @ApiProperty()
    @IsString()
    job: string;
    
    @ApiProperty()
    @IsInt()
    experience: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    telegram?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    instagram?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    linkedin?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    facebook?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    github?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    website?: string;
}
