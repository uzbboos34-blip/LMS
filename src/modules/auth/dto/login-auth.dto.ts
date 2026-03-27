import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateAuthDto } from './create-auth.dto';
import { IsString } from 'class-validator';

export class LoginAuthDto {
    @ApiProperty({example: "+998907012161"})
    @IsString()
    phone: string;

    @ApiProperty({example: "1234567"})
    @IsString()
    password: string;
}
