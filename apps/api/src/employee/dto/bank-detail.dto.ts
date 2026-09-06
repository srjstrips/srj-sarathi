import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpsertBankDetailDto {
  @IsString() @MaxLength(200) accountName: string;
  @IsString() @MaxLength(50)  accountNumber: string;
  @IsString() @MaxLength(20)  ifsc: string;
  @IsOptional() @IsString() @MaxLength(200) bankName?: string;
  @IsOptional() @IsString() @MaxLength(200) branch?: string;
}
