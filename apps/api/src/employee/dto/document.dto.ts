import { IsString, IsOptional, IsUUID, IsDateString, MaxLength, IsEnum } from 'class-validator';

export class UploadDocumentDto {
  @IsUUID()   categoryId: string;
  @IsString() @MaxLength(500) filename: string;
  @IsString() @MaxLength(100) mimeType: string;
  @IsString() storageKey: string;
  @IsOptional() @IsString() @MaxLength(100) documentNumber?: string;
  @IsOptional() @IsDateString() issueDate?: string;
  @IsOptional() @IsDateString() expiryDate?: string;
}

export class VerifyDocumentDto {
  @IsEnum(['VERIFIED', 'REJECTED']) verificationStatus: string;
  @IsOptional() @IsString() verificationNote?: string;
}
