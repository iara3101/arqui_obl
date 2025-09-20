import bcrypt from 'bcrypt';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const company = await prisma.company.upsert({
    where: { name: 'ORT' },
    update: {},
    create: { name: 'ORT' },
  });

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@ort.com';
  const memberEmail = process.env.SEED_MEMBER_EMAIL ?? 'member@ort.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!';
  const memberPassword = process.env.SEED_MEMBER_PASSWORD ?? 'Member123!';

  const adminHash = await bcrypt.hash(adminPassword, 12);
  const memberHash = await bcrypt.hash(memberPassword, 12);

  await prisma.user.upsert({
    where: {
      companyId_email: {
        companyId: company.id,
        email: adminEmail,
      },
    },
    update: {
      passwordHash: adminHash,
      forcePasswordReset: false,
      role: UserRole.ADMIN,
    },
    create: {
      companyId: company.id,
      email: adminEmail,
      passwordHash: adminHash,
      forcePasswordReset: false,
      role: UserRole.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: {
      companyId_email: {
        companyId: company.id,
        email: memberEmail,
      },
    },
    update: {
      passwordHash: memberHash,
      forcePasswordReset: false,
      role: UserRole.MEMBER,
    },
    create: {
      companyId: company.id,
      email: memberEmail,
      passwordHash: memberHash,
      forcePasswordReset: false,
      role: UserRole.MEMBER,
    },
  });

  console.log('Seed completed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
