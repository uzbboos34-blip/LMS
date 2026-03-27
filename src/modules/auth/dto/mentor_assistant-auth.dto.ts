import { ApiProperty } from "@nestjs/swagger";
import { UserRole } from "@prisma/client";
import { IsEnum } from "class-validator";
import { CreateUserDto } from "src/modules/user/dto/create-user.dto";

export class MentorAssistantAuthDto extends CreateUserDto {
    @ApiProperty()
    @IsEnum(UserRole)
    role: UserRole
}
