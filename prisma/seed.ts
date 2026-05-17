import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.activity.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.dealFile.deleteMany()
  await prisma.deal.deleteMany()
  await prisma.expense.deleteMany()
  await prisma.user.deleteMany()

  // Create admin (Kirill)
  const kirill = await prisma.user.create({
    data: {
      email: 'kirill@example.com',
      name: 'Кирилл',
      role: 'ADMIN',
      passwordHash: await bcrypt.hash('kirill123', 12),
    },
  })

  // Create manager (Vladislav)
  const vladislav = await prisma.user.create({
    data: {
      email: 'vladislav@example.com',
      name: 'Владислав',
      role: 'MANAGER',
      passwordHash: await bcrypt.hash('vladislav123', 12),
    },
  })

  console.log('✓ Created users:', { kirill, vladislav })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
