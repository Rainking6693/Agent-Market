/**
 * Grant beta access to a specific user
 * Run with: npx tsx grant-beta-access.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = 'rainking6693@gmail.com';

  const user = await prisma.user.update({
    where: { email },
    data: {
      role: 'admin',
      betaAccess: true,
      providerBeta: true,
    },
  });

  console.log('✅ Beta access granted to user:');
  console.log(`   Email: ${user.email}`);
  console.log(`   Name: ${user.displayName}`);
  console.log(`   Role: ${user.role}`);
  console.log(`   Beta Access: ${user.betaAccess}`);
  console.log(`   Provider Beta: ${user.providerBeta}`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
