# U-Turn4Nature PIC Partner Portal

A complete production-ready full-stack web application designed for the "U-Turn4Nature" e-commerce business. This portal serves as a platform to manage Partner In Charge (PIC) affiliates, their referrals, commissions, and integration with Shopify.

## Features

- **Eco-Friendly UI**: A premium modern design featuring glassmorphism, smooth animations, and earthy tones (Forest Green, Olive, Sage, Beige, Gold).
- **Two Portals in One**:
  - **Admin Portal**: Approve PICs, view overall dashboard metrics, manage payouts, and configure Shopify API settings.
  - **PIC Portal**: Track referrals, view earnings/wallet balance, request payouts, and copy referral links.
- **Shopify Integration**: Automated commission calculation via Shopify Webhooks (`orders/paid`) utilizing discount codes and cart attributes.
- **Secure Authentication**: JWT with HTTP-only cookies, password hashing, Multi-step OTP registration, Role-based Access Control (RBAC).

## Technology Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Framer Motion, Zustand, React Hook Form, Zod, Recharts, Axios.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL.
- **Security**: Helmet, CORS, Rate Limiting, bcryptjs, AES/HMAC-SHA256 Encryption for Shopify keys and webhooks.

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- Shopify Store (with Admin API access)

### 2. Installation

1. Install root dependencies (for running both servers concurrently):
   \`\`\`bash
   npm install
   \`\`\`

2. Install backend and frontend dependencies:
   \`\`\`bash
   npm run install:all
   \`\`\`

### 3. Environment Variables

Create `.env` files based on the provided examples:

- \`backend/.env\` (See \`backend/.env.example\`)
- \`frontend/.env.local\` (See \`frontend/.env.example\`)

### 4. Database Setup (Backend)

1. Navigate to the backend folder:
   \`\`\`bash
   cd backend
   \`\`\`
2. Generate Prisma client and push schema:
   \`\`\`bash
   npx prisma generate
   npx prisma db push
   \`\`\`
3. Seed the initial admin user:
   \`\`\`bash
   npm run seed:admin
   \`\`\`

### 5. Running the Application

To run both frontend and backend concurrently from the root directory:

\`\`\`bash
npm run dev
\`\`\`

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

## Access

- **Admin Login**: \`http://localhost:3000/admin/login\`
- **PIC Login**: \`http://localhost:3000/login\`
- **PIC Registration**: \`http://localhost:3000/register\`

## Webhooks

Ensure you configure the Shopify Webhook in your Shopify Admin Panel:
- **Event**: Order creation (or Order payment)
- **Format**: JSON
- **URL**: \`https://<your-production-domain>/api/webhooks/shopify\`
- **Webhook API Version**: Latest

Once configured, save the Webhook Secret in the Admin Portal -> Settings page.
