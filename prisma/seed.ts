import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

async function main() {
  // Idempotent: skip if users already exist
  const existingCount = await prisma.user.count()
  if (existingCount > 0) {
    console.log(`✓ Database already has ${existingCount} users — skipping seed`)
    return
  }

  await prisma.user.create({
    data: {
      email: 'kirill@example.com',
      name: 'Кирилл',
      role: 'ADMIN',
      passwordHash: await bcrypt.hash('kirill123', 12),
    },
  })

  await prisma.user.create({
    data: {
      email: 'vladislav@example.com',
      name: 'Владислав',
      role: 'MANAGER',
      passwordHash: await bcrypt.hash('vladislav123', 12),
    },
  })

  console.log('✓ Created admin (kirill@example.com) and manager (vladislav@example.com)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
