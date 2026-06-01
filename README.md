# BookBridge — Student Book Marketplace

A full-stack Next.js 14 web application for buying and selling competitive exam books in India.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom design system |
| Database | PostgreSQL via Prisma ORM |
| Auth | JWT (httpOnly cookies) |
| Payments | Razorpay (integration-ready) |
| Images | Cloudinary (integration-ready) |

---

## Setup Instructions

### 1. Clone & Install

```bash
git clone <repo>
cd bookbridge
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Fill in `.env`:
```
DATABASE_URL="postgresql://user:password@localhost:5432/bookbridge"
NEXTAUTH_SECRET="your-super-secret-key-minimum-32-chars"
JWT_SECRET="your-jwt-secret-minimum-32-characters"
NEXTAUTH_URL="http://localhost:3000"
RAZORPAY_KEY_ID="..."
RAZORPAY_KEY_SECRET="..."
CLOUDINARY_CLOUD_NAME="..."
```

### 3. Set Up Database

```bash
npx prisma generate
npx prisma db push
```

### 4. (Optional) Seed admin user

```bash
npx ts-node scripts/seed.ts
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Pages

### Public
- `/` — Premium landing page
- `/books` — Browse with filters and search
- `/books/[bookId]` — Book detail with seller info

### Buyer
- `/auth/login` — Login
- `/auth/register` — Register
- `/dashboard` — Personalized home
- `/cart` — Shopping cart
- `/orders` — Order history with tracking
- `/wishlist` — Saved books
- `/profile` — Account management

### Seller
- `/seller/onboard` — 3-step seller setup
- `/seller/dashboard` — Stats overview
- `/seller/books` — Manage listings
- `/seller/books/add` — Add new listing
- `/seller/earnings` — Revenue and payouts
- `/seller/orders` — Incoming orders

### Admin
- `/admin/dashboard` — Platform KPIs
- `/admin/users` — User management with block/suspend

---

## API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |
| GET | `/api/books` | List books (search, filter, sort) |
| GET | `/api/books/[id]` | Book detail |
| POST | `/api/books` | Create listing |
| PUT | `/api/books/[id]` | Update listing |
| DELETE | `/api/books/[id]` | Delete listing |
| GET | `/api/books/trending` | Trending books |
| GET/POST/DELETE | `/api/cart` | Cart management |
| GET/POST/DELETE | `/api/wishlist` | Wishlist management |
| GET/POST | `/api/orders` | Orders |
| POST | `/api/reviews` | Submit review |
| GET/POST | `/api/seller/dashboard` | Seller stats |
| POST | `/api/seller/onboard` | Seller setup |
| GET | `/api/seller/orders` | Seller's orders |
| PUT | `/api/users/profile` | Update profile |
| GET | `/api/admin/dashboard` | Admin stats |
| GET | `/api/admin/users` | List all users |
| PATCH | `/api/admin/users/[id]/status` | Block/suspend user |

---

## Security

- **JWT** stored in `httpOnly` secure cookies (not accessible to JS)
- **Password hashing** with bcrypt (12 rounds)
- **Role-based access control** via middleware and API guards
- **Input validation** with Zod on all endpoints
- **SQL injection protection** via Prisma parameterized queries
- **CORS** handled by Next.js defaults
- **Rate limiting** — add `npm i @upstash/ratelimit` for production

---

## Database Schema (18 Tables)

`users` · `seller_profiles` · `books` · `book_images` · `addresses` · `orders` · `order_tracking` · `payments` · `carts` · `wishlists` · `conversations` · `messages` · `reviews` · `notifications` · `reports` · `coupons` · `coupon_usages` · `pickup_schedules` · `payouts`

---

## Design System

- **Primary color**: Gold `#C9A84C` — trust, premium feel
- **Background**: Deep ink `#0A0A0F` — contrast, focus
- **Accent text**: Cream `#F5F0E8` — warmth
- **Font display**: Playfair Display (headings)
- **Font body**: DM Sans (body text)
- **Glass morphism**: `backdrop-filter: blur` cards throughout
- **Hover animations**: subtle lift + gold border glow

---

## Production Checklist

- [ ] Set all environment variables
- [ ] Run `npx prisma generate && npx prisma db push`
- [ ] Configure Razorpay webhooks
- [ ] Configure Cloudinary upload presets
- [ ] Set up Pusher for real-time chat
- [ ] Add rate limiting middleware
- [ ] Enable HTTPS (handled by Vercel/hosting)
- [ ] Set `NEXTAUTH_URL` to production domain

