import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10)

  const manager = await prisma.user.upsert({
    where: { email: 'manager@rms.com' },
    update: {},
    create: {
      email: 'manager@rms.com',
      password: hashedPassword,
      name: 'Manager User',
      role: 'MANAGER',
      isActive: true,
    },
  })

  const waiter = await prisma.user.upsert({
    where: { email: 'waiter@rms.com' },
    update: {},
    create: {
      email: 'waiter@rms.com',
      password: hashedPassword,
      name: 'Waiter User',
      role: 'WAITER',
      isActive: true,
    },
  })

  const chef = await prisma.user.upsert({
    where: { email: 'chef@rms.com' },
    update: {},
    create: {
      email: 'chef@rms.com',
      password: hashedPassword,
      name: 'Chef User',
      role: 'CHEF',
      isActive: true,
    },
  })

  const cashier = await prisma.user.upsert({
    where: { email: 'cashier@rms.com' },
    update: {},
    create: {
      email: 'cashier@rms.com',
      password: hashedPassword,
      name: 'Cashier User',
      role: 'CASHIER',
      isActive: true,
    },
  })

  console.log('✅ Users created:', { manager, waiter, chef, cashier })

  // Create categories
  const appetizers = await prisma.category.create({
    data: {
      name: 'Appetizers',
      description: 'Start your meal with our delicious appetizers',
      sortOrder: 1,
    },
  })

  const mainCourse = await prisma.category.create({
    data: {
      name: 'Main Course',
      description: 'Hearty main dishes',
      sortOrder: 2,
    },
  })

  const beverages = await prisma.category.create({
    data: {
      name: 'Beverages',
      description: 'Refreshing drinks',
      sortOrder: 3,
    },
  })

  const desserts = await prisma.category.create({
    data: {
      name: 'Desserts',
      description: 'Sweet endings',
      sortOrder: 4,
    },
  })

  console.log('✅ Categories created')

  // Create menu items
  const menuItems = [
    // Appetizers
    {
      name: 'Spring Rolls',
      description: 'Crispy vegetable spring rolls with sweet chili sauce',
      price: 8.99,
      categoryId: appetizers.id,
      isVeg: true,
      prepTime: 10,
    },
    {
      name: 'Chicken Wings',
      description: 'Spicy buffalo chicken wings with blue cheese dip',
      price: 12.99,
      categoryId: appetizers.id,
      isVeg: false,
      prepTime: 15,
    },
    {
      name: 'Garlic Bread',
      description: 'Toasted bread with garlic butter and herbs',
      price: 5.99,
      categoryId: appetizers.id,
      isVeg: true,
      prepTime: 8,
    },
    // Main Course
    {
      name: 'Grilled Chicken',
      description: 'Juicy grilled chicken with vegetables and mashed potatoes',
      price: 18.99,
      categoryId: mainCourse.id,
      isVeg: false,
      prepTime: 25,
    },
    {
      name: 'Vegetable Pasta',
      description: 'Penne pasta with seasonal vegetables in tomato sauce',
      price: 14.99,
      categoryId: mainCourse.id,
      isVeg: true,
      prepTime: 20,
    },
    {
      name: 'Beef Steak',
      description: 'Premium beef steak cooked to perfection',
      price: 28.99,
      categoryId: mainCourse.id,
      isVeg: false,
      prepTime: 30,
    },
    {
      name: 'Margherita Pizza',
      description: 'Classic pizza with fresh mozzarella and basil',
      price: 16.99,
      categoryId: mainCourse.id,
      isVeg: true,
      prepTime: 18,
    },
    // Beverages
    {
      name: 'Fresh Orange Juice',
      description: 'Freshly squeezed orange juice',
      price: 4.99,
      categoryId: beverages.id,
      isVeg: true,
      prepTime: 5,
    },
    {
      name: 'Cappuccino',
      description: 'Classic Italian cappuccino',
      price: 3.99,
      categoryId: beverages.id,
      isVeg: true,
      prepTime: 5,
    },
    {
      name: 'Iced Tea',
      description: 'Refreshing iced tea with lemon',
      price: 2.99,
      categoryId: beverages.id,
      isVeg: true,
      prepTime: 3,
    },
    // Desserts
    {
      name: 'Chocolate Cake',
      description: 'Rich chocolate cake with vanilla ice cream',
      price: 7.99,
      categoryId: desserts.id,
      isVeg: true,
      prepTime: 8,
    },
    {
      name: 'Tiramisu',
      description: 'Classic Italian tiramisu',
      price: 8.99,
      categoryId: desserts.id,
      isVeg: true,
      prepTime: 5,
    },
  ]

  for (const item of menuItems) {
    await prisma.menuItem.create({ data: item })
  }

  console.log('✅ Menu items created')

  // Create tables
  const tableData = [
    { tableNumber: 1, capacity: 2, positionX: 100, positionY: 100, shape: 'ROUND' as const },
    { tableNumber: 2, capacity: 2, positionX: 250, positionY: 100, shape: 'ROUND' as const },
    { tableNumber: 3, capacity: 4, positionX: 400, positionY: 100, shape: 'SQUARE' as const },
    { tableNumber: 4, capacity: 4, positionX: 100, positionY: 250, shape: 'SQUARE' as const },
    { tableNumber: 5, capacity: 6, positionX: 250, positionY: 250, shape: 'RECTANGULAR' as const },
    { tableNumber: 6, capacity: 4, positionX: 400, positionY: 250, shape: 'SQUARE' as const },
    { tableNumber: 7, capacity: 2, positionX: 100, positionY: 400, shape: 'ROUND' as const },
    { tableNumber: 8, capacity: 8, positionX: 250, positionY: 400, shape: 'RECTANGULAR' as const },
  ]

  for (const table of tableData) {
    await prisma.table.upsert({
      where: { tableNumber: table.tableNumber },
      update: {},
      create: table,
    })
  }

  console.log('✅ Tables created')

  console.log('🎉 Seeding complete!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
