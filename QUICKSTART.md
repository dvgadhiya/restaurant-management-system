# Quick Start Guide

## System Overview

The Restaurant Management System (RMS) provides a complete solution for restaurant operations with four distinct user interfaces:

### 1. Manager Interface (`/manager`)
- Dashboard with sales overview
- Menu management (add/edit/delete items, mark sold out)
- Table management
- Sales reports
- Inventory tracking

### 2. Waiter Interface (`/waiter`)
- Visual table grid showing status
- Order taking interface
- Add items to cart
- Submit orders to kitchen
- Special instructions for items

### 3. Kitchen Display System (`/kitchen`)
- Real-time order display
- Order status management:
  - NEW → Start Cooking → IN_PROGRESS
  - IN_PROGRESS → Mark Ready → READY
- Time tracking since order
- Auto-refresh every 10 seconds

### 4. Cashier/POS Interface (`/cashier`)
- View ready orders
- Process payments (Cash/Card/UPI)
- Apply discounts
- Generate bills

## Getting Started

1. **Install and setup:**
```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run db:seed
npm run dev
```

2. **Login with demo credentials:**
   - Manager: manager@rms.com / password123
   - Waiter: waiter@rms.com / password123
   - Chef: chef@rms.com / password123
   - Cashier: cashier@rms.com / password123

3. **Test the complete flow:**

   a. **As Waiter:**
   - Login as waiter
   - Click on a free table (green)
   - Browse menu items
   - Add items to cart
   - Add special instructions (e.g., "no onions")
   - Submit order

   b. **As Chef:**
   - Login as chef
   - See the new order appear (red card)
   - Click "Start Cooking" → order turns yellow
   - Click "Mark Ready" → order is ready for serving

   c. **As Cashier:**
   - Login as cashier
   - See the ready order
   - Click on the order card
   - Apply discount if needed
   - Select payment method
   - Process payment

   d. **As Manager:**
   - Login as manager
   - View dashboard statistics
   - Go to Menu page
   - Toggle items as available/sold out
   - View recent orders

## Key Features Demonstrated

✅ Real-time order flow (Waiter → Kitchen → Cashier)
✅ Role-based access control
✅ Table status management (Free → Occupied → Free)
✅ Menu management with categories
✅ Special instructions for orders
✅ Multiple payment methods
✅ Discount application
✅ Sales tracking and reports

## Development Tips

- The app uses SQLite for easy setup
- All passwords are hashed with bcrypt
- NextAuth handles authentication
- Prisma manages database operations
- shadcn/ui provides the UI components

## Troubleshooting

**Issue**: Can't login
- Check that `npm run db:seed` ran successfully
- Verify `.env` file has `DATABASE_URL` and `NEXTAUTH_SECRET`

**Issue**: Orders not appearing in kitchen
- Check the order status (must be NEW or IN_PROGRESS)
- Refresh the kitchen page

**Issue**: Can't process payment
- Ensure order status is READY or SERVED
- Check that you're logged in as CASHIER

## Next Steps

For production deployment:
1. Switch from SQLite to PostgreSQL/MySQL
2. Add real payment gateway integration
3. Implement WebSockets for real-time updates
4. Add proper error logging and monitoring
5. Set up automated backups
6. Configure SSL/HTTPS
7. Add comprehensive testing

## Support

This is an educational project. For questions, refer to the main README.md.
