import { PartialType } from '@nestjs/mapped-types';
import { CreateLastActivityDto } from './create-last-activity.dto';

export class UpdateLastActivityDto extends PartialType(CreateLastActivityDto) {}
