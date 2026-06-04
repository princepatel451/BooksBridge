/**
 * Seed script — run with: npx ts-node scripts/seed.ts
 * Creates an admin user and sample book listings for development
 */
import { prisma } from '../lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Seeding BookBridge database...')

  // Admin user
  const adminHash = await bcrypt.hash('Admin@123456', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bookbridge.in' },
    update: {},
    create: {
      fullName: 'Admin User',
      email: 'admin@bookbridge.in',
      passwordHash: adminHash,
      role: 'ADMIN',
      city: 'Delhi',
      isEmailVerified: true,
    },
  })
  console.log('✅ Admin created:', admin.email)

  // Seller user
  const sellerHash = await bcrypt.hash('Seller@123456', 12)
  const seller = await prisma.user.upsert({
    where: { email: 'seller@example.com' },
    update: {},
    create: {
      fullName: 'Rahul Gupta',
      email: 'seller@example.com',
      passwordHash: sellerHash,
      role: 'BUYER',
      isSeller: true,
      city: 'Delhi',
      isEmailVerified: true,
      sellerProfile: {
        create: {
          displayName: 'Rahul Books',
          bio: 'IIT graduate selling JEE and NEET books',
          verificationStatus: 'VERIFIED',
          avgRating: 4.7,
          totalBooksSold: 23,
        },
      },
    },
  })
  console.log('✅ Seller created:', seller.email)

  // Sample books
  const books = [
    {
      title: 'Concepts of Physics Vol 1',
      author: 'H.C. Verma',
      edition: '2023',
      publisher: 'Bharati Bhawan',
      examCategory: 'JEE',
      subject: 'Physics',
      conditionScore: 8,
      conditionNotes: 'Minor pencil markings in 2 chapters',
      marketPrice: 320,
      sellingPrice: 120,
      city: 'Delhi',
    },
    {
      title: 'NCERT Biology Class 12',
      author: 'NCERT',
      edition: '2023',
      examCategory: 'NEET',
      subject: 'Biology',
      conditionScore: 9,
      marketPrice: 190,
      sellingPrice: 70,
      city: 'Delhi',
    },
    {
      title: 'Indian Polity',
      author: 'M. Laxmikant',
      edition: '6th Edition',
      publisher: 'McGraw Hill',
      examCategory: 'UPSC',
      subject: 'Polity',
      conditionScore: 7,
      conditionNotes: 'Highlighted with yellow marker throughout',
      marketPrice: 650,
      sellingPrice: 280,
      city: 'Delhi',
    },
    {
      title: 'Problems in Physical Chemistry',
      author: 'N. Avasthi',
      edition: '2022',
      examCategory: 'JEE',
      subject: 'Chemistry',
      conditionScore: 8,
      marketPrice: 280,
      sellingPrice: 100,
      city: 'Mumbai',
    },
    {
      title: 'Objective Mathematics',
      author: 'R.D. Sharma',
      edition: '2023',
      examCategory: 'JEE',
      subject: 'Mathematics',
      conditionScore: 6,
      conditionNotes: 'Some pages have corner folds, all content intact',
      marketPrice: 800,
      sellingPrice: 320,
      city: 'Bangalore',
    },
  ]

  for (const book of books) {
    await prisma.book.create({
      data: { ...book, sellerId: seller.id, status: 'ACTIVE', moderationStatus: 'APPROVED' },
    })
  }
  console.log(`✅ Created ${books.length} sample books`)

  // Buyer user
  const buyerHash = await bcrypt.hash('Buyer@123456', 12)
  await prisma.user.upsert({
    where: { email: 'buyer@example.com' },
    update: {},
    create: {
      fullName: 'Priya Sharma',
      email: 'buyer@example.com',
      passwordHash: buyerHash,
      role: 'BUYER',
      city: 'Delhi',
      isEmailVerified: true,
    },
  })
  console.log('✅ Buyer created: buyer@example.com')

  console.log('\n🎉 Seeding complete!\n')
  console.log('Test accounts:')
  console.log('  Admin:  admin@bookbridge.in  / Admin@123456')
  console.log('  Seller: seller@example.com   / Seller@123456')
  console.log('  Buyer:  buyer@example.com    / Buyer@123456')
}

main().catch(console.error).finally(() => prisma.$disconnect())
