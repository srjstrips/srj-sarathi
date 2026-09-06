import { IsUUID } from 'class-validator';

export class BindUserDto {
  @IsUUID() userId: string;
}
