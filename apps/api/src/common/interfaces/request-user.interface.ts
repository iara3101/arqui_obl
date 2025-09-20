import { UserRole } from '@prisma/client';

export interface RequestUser {
  userId: string;
  companyId: string;
  email: string;
  role: UserRole;
  forcePasswordReset?: boolean;
}
