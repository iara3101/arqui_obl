import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { PasswordService } from '../common/password.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UserRole } from '../../common/enums/user-role.enum';

@Injectable()
export class CompaniesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) {}

  async create(payload: CreateCompanyDto) {
    try {
      const passwordHash = await this.passwordService.hash(
        payload.adminPassword,
      );
      return await this.prisma.$transaction(async (tx) => {
        const company = await tx.company.create({
          data: {
            name: payload.name,
          },
        });

        await tx.user.create({
          data: {
            companyId: company.id,
            email: payload.adminEmail.toLowerCase(),
            passwordHash,
            role: UserRole.ADMIN,
            forcePasswordReset: false,
          },
        });

        return company;
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Company or user already exists');
      }
      throw error;
    }
  }

  async getCompany(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    return company;
  }
}
