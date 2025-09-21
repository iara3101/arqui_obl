import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreatePresignDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  opportunityId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  filename!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  contentType!: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  size!: number;
}
