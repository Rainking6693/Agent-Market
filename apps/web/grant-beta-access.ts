/**
 * Grant beta access to a specific user
 * Run with: npx tsx grant-beta-access.ts <email> [--admin]
 *
 * Examples:
 *   npx tsx grant-beta-access.ts user@example.com
 *   npx tsx grant-beta-access.ts user@example.com --admin
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: npx tsx grant-beta-access.ts <email> [--admin]');
    console.error('');
    console.error('Options:');
    console.error('  --admin    Also grant admin role');
    console.error('');
    console.error('Example:');
    console.error('  npx tsx grant-beta-access.ts user@example.com');
    console.error('  npx tsx grant-beta-access.ts user@example.com --admin');
    process.exit(1);
  }

  const email = args[0];
  const makeAdmin = args.includes('--admin');

  // Validate email format
  if (!email.includes('@')) {
    console.error('Error: Invalid email format');
    process.exit(1);
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: {
        ...(makeAdmin && { role: 'admin' }),
        betaAccess: true,
        providerBeta: true,
      },
    });

    console.log('Beta access granted to user:');
    console.log(`   Email: ${user.email}`);
    console.log(`   Name: ${user.displayName}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Beta Access: ${user.betaAccess}`);
    console.log(`   Provider Beta: ${user.providerBeta}`);
  } catch (error) {
    if ((error as { code?: string }).code === 'P2025') {
      console.error(`Error: User with email "${email}" not found`);
      process.exit(1);
    }
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
