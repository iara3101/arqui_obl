import 'dotenv/config';
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!';
  const memberPassword = process.env.SEED_MEMBER_PASSWORD ?? 'Member123!';
  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);

  const [company] = await prisma.$transaction(async (tx) => {
    const company = await tx.company.upsert({
      where: { name: 'ORT' },
      update: {},
      create: { name: 'ORT' },
    });

    const adminHash = await bcrypt.hash(adminPassword, saltRounds);
    await tx.user.upsert({
      where: {
        companyId_email: {
          companyId: company.id,
          email: 'admin@ort.com',
        },
      },
      update: {
        passwordHash: adminHash,
        forcePasswordReset: false,
        role: UserRole.ADMIN,
      },
      create: {
        companyId: company.id,
        email: 'admin@ort.com',
        passwordHash: adminHash,
        role: UserRole.ADMIN,
        forcePasswordReset: false,
      },
    });

    const memberHash = await bcrypt.hash(memberPassword, saltRounds);
    await tx.user.upsert({
      where: {
        companyId_email: {
          companyId: company.id,
          email: 'member@ort.com',
        },
      },
      update: {
        passwordHash: memberHash,
        forcePasswordReset: false,
        role: UserRole.MEMBER,
      },
      create: {
        companyId: company.id,
        email: 'member@ort.com',
        passwordHash: memberHash,
        role: UserRole.MEMBER,
        forcePasswordReset: false,
      },
    });

    return [company];
  });

  // eslint-disable-next-line no-console
  console.log(`Seed completed for company ${company.name}`);
}

main()
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
