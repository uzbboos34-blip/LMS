import { ApiExtraModels, ApiProperty } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsBoolean, IsEnum } from "class-validator";
import { CreateUserDto } from "src/modules/user/dto/create-user.dto";

@ApiExtraModels(CreateUserDto)
export class CreateAuthAdminDto extends CreateUserDto {
    @ApiProperty()
    @IsEnum(UserRole)
    role: UserRole

    @ApiProperty()
    @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
    })
    @IsBoolean()
    isPrimaryAdmin: boolean;
}
