import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { IsOptional, IsString } from 'class-validator';

export class ListContactsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  accountId?: string;
}
