# 💊 Pharmacy E-Commerce Frontend

Modern, responsive e-commerce frontend for pharmacies built with Next.js 14.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3-38B2AC)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🎯 Features

### 👤 Customer Features
- **Product Browsing**: Search, filter, and view products
- **Shopping Cart**: Add/remove items, quantity management
- **Checkout**: Complete order placement with address selection
- **Order Tracking**: View order history and status
- **Favorites**: Save products for later
- **Profile Management**: Update personal info, change password
- **Address Book**: Manage multiple delivery addresses

### 🏥 Pharmacy Admin Features (Owner/Staff)
- **Product Management**: CRUD operations, stock management
- **Order Management**: View and update order status
- **Category Viewing**: Browse product categories
- **Staff Management**: Add/manage staff (Owner only)
- **Reports**: Sales and performance analytics

### 🌐 Super Admin Features
- **Pharmacy Management**: Manage all pharmacies
- **User Management**: Manage all users
- **Subscription Management**: Handle subscriptions
- **Category Management**: CRUD for categories
- **Platform Settings**: Global configuration
- **Platform Reports**: Overall statistics

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     NEXT.JS FRONTEND                        │
├─────────────────────────────────────────────────────────────┤
│  app/                                                        │
│  ├── (shop)/        → Customer pages (with Header/Footer)   │
│  ├── (admin)/       → Admin dashboard (separate layout)     │
│  ├── (auth)/        → Login/Register pages                  │
│  └── layout.tsx     → Root layout                           │
├─────────────────────────────────────────────────────────────┤
│  components/        → Reusable UI components                │
│  contexts/          → Auth & Cart state management          │
│  lib/               → API functions & utilities             │
│  types/             → TypeScript interfaces                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  SPRING BOOT BACKEND API                    │
│              http://localhost:8080/api                      │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend API running on `http://localhost:8080`

### Installation

```bash
# Clone the repository
git clone https://github.com/merve-ceylan/pharmacy-frontend.git
cd pharmacy-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@pharmacy.com | Admin123!@# |
| Pharmacy Owner | owner@demo.com | Owner123!@# |
| Staff | staff@demo.com | Staff123!@# |
| Customer | test@test.com | Pharmacy2024!@# |

## 📁 Project Structure

```
pharmacy-frontend/
├── app/
│   ├── (shop)/                 # Customer-facing pages
│   │   ├── layout.tsx          # Header + Footer layout
│   │   ├── page.tsx            # Homepage
│   │   ├── products/           # Product listing & detail
│   │   ├── cart/               # Shopping cart
│   │   ├── checkout/           # Checkout process
│   │   ├── orders/             # Order history
│   │   ├── favorites/          # Saved products
│   │   └── profile/            # User profile & addresses
│   │
│   ├── (admin)/                # Admin dashboard
│   │   ├── layout.tsx          # Clean layout (no Header/Footer)
│   │   └── dashboard/
│   │       ├── page.tsx        # Dashboard home
│   │       ├── products/       # Product management
│   │       ├── orders/         # Order management
│   │       ├── categories/     # Category management
│   │       ├── users/          # User/Staff management
│   │       ├── pharmacies/     # Pharmacy management (Super Admin)
│   │       ├── subscriptions/  # Subscription management
│   │       ├── reports/        # Reports & analytics
│   │       └── settings/       # Settings
│   │
│   ├── (auth)/                 # Authentication pages
│   │   ├── layout.tsx          # Auth layout
│   │   ├── login/              # Login page
│   │   └── register/           # Registration page
│   │
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
│
├── components/
│   ├── Header.tsx              # Navigation header
│   ├── Footer.tsx              # Site footer
│   └── Toast.tsx               # Notification component
│
├── contexts/
│   ├── AuthContext.tsx         # Authentication state
│   └── CartContext.tsx         # Shopping cart state
│
├── lib/
│   └── api.ts                  # API client functions
│
├── types/
│   └── index.ts                # TypeScript interfaces
│
├── tailwind.config.ts          # Tailwind configuration
├── next.config.js              # Next.js configuration
└── package.json
```

## 🎨 Pages Overview

### Public Pages
| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Landing page with featured products |
| Products | `/products` | Product listing with search |
| Product Detail | `/products/[slug]` | Single product view |
| Login | `/login` | User authentication |
| Register | `/register` | New user registration |

### Customer Pages (Authenticated)
| Page | Route | Description |
|------|-------|-------------|
| Cart | `/cart` | Shopping cart |
| Checkout | `/checkout` | Order placement |
| Orders | `/orders` | Order history |
| Order Detail | `/orders/[orderNumber]` | Single order view |
| Favorites | `/favorites` | Saved products |
| Profile | `/profile` | User settings |
| Addresses | `/profile/addresses` | Address management |

### Admin Pages
| Page | Route | Access |
|------|-------|--------|
| Dashboard | `/dashboard` | All admin roles |
| Products | `/dashboard/products` | Owner, Staff |
| Orders | `/dashboard/orders` | Owner, Staff |
| Categories | `/dashboard/categories` | Super Admin |
| Users | `/dashboard/users` | Super Admin, Owner |
| Pharmacies | `/dashboard/pharmacies` | Super Admin |
| Subscriptions | `/dashboard/subscriptions` | Super Admin |
| Reports | `/dashboard/reports` | Super Admin, Owner |
| Settings | `/dashboard/settings` | All admin roles |

## 🔐 Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│  Login   │────▶│   API    │────▶│   JWT    │
│  Form    │     │  /login  │     │  Token   │
└──────────┘     └──────────┘     └──────────┘
                                       │
                                       ▼
                              ┌──────────────┐
                              │ localStorage │
                              │ accessToken  │
                              │ refreshToken │
                              │ user         │
                              └──────────────┘
                                       │
                                       ▼
                              ┌──────────────┐
                              │ AuthContext  │
                              │ (React)      │
                              └──────────────┘
```

## 🛠️ Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Fetch API
- **Authentication**: JWT (stored in localStorage)

## 📱 Responsive Design

The application is fully responsive and works on:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Large screens (1280px+)

## 🔧 Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Linting
npm run lint         # Run ESLint
```

## 🔗 Related Repositories

- **Backend API**: [pharmacy](https://github.com/merve-ceylan/pharmacy) - Spring Boot REST API

## 🛣️ Roadmap

- [x] Project setup with Next.js 14
- [x] Authentication (Login/Register)
- [x] Product listing and detail pages
- [x] Shopping cart functionality
- [x] Checkout and order placement
- [x] Customer profile management
- [x] Address management
- [x] Favorites system
- [x] Admin dashboard
- [x] Product management (Admin)
- [x] Order management (Admin)
- [x] Category management (Super Admin)
- [x] Role-based access control
- [x] Toast notification system
- [x] Skeleton loading animations
- [x] Button loading spinners
- [x] Admin dashboard skeleton/toast improvements
- [x] Pharmacy management (Super Admin) - CRUD operations
- [x] Modern UI/UX improvements (hover effects, transitions)
- [ ] Product image upload
- [ ] Real-time notifications
- [ ] Email verification
- [ ] Password reset flow
- [ ] Payment integration (iyzico)
- [ ] Multi-language support (TR/EN)

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 👨‍💻 Author

Built with ❤️ for Turkish pharmacies