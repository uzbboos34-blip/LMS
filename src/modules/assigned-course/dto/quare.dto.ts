import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";

export class QueryDto {
    @ApiPropertyOptional()
    @IsBoolean()
    isDeleted?: boolean
}