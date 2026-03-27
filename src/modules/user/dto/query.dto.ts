import { ApiPropertyOptional } from "@nestjs/swagger";
import { Status, UserRole } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class QueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    fullName?: string

    @ApiPropertyOptional({
        enum: Status
    })
    @IsOptional()
    @IsEnum(Status)
    status?: Status

    @ApiPropertyOptional({enum: UserRole})
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole
}