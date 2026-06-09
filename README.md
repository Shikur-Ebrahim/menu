# Nemu – Digital QR Menu System

A production-ready multi-tenant SaaS QR menu platform for hotels, restaurants, and cafés built with Next.js 16, Firebase, and Tailwind CSS v4.

---

## 🚀 Quick Start

```bash
# 1. Clone and install
npm install

# 2. Configure environment variables
cp .env.local.example .env.local
# Fill in your Firebase and Cloudinary credentials

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Firebase Setup

### Step 1 – Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (e.g. "nemu-app")
3. Enable **Authentication** → Email/Password provider
4. Enable **Firestore Database** → Start in production mode

### Step 2 – Get Config Keys
1. Project Settings → General → Your apps → Add Web App
2. Copy the config object values into your `.env.local`

### Step 3 – Create Super Admin
1. In Firebase Console → Authentication → Add user manually:
   - Email: `admin@nemu.com`
   - Password: (choose a strong password)
2. Copy the UID of this user
3. In Firestore → Create document in `users` collection with this UID:
```json
{
  "uid": "<firebase-uid>",
  "restaurantName": "Nemu Admin",
  "phoneNumber": "0000000000",
  "authEmail": "admin@nemu.com",
  "generatedPassword": "",
  "role": "admin",
  "status": "approved",
  "createdAt": "<timestamp>"
}
```

### Step 4 – Deploy Firestore Rules
Copy the contents of `firestore.rules` into your Firestore Rules tab and publish.

---

## 🖼️ Cloudinary Setup

1. Create a free account at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard → copy Cloud Name, API Key, API Secret
3. Go to Settings → Upload → Add upload preset named `nemu_uploads` (unsigned)
4. Add all values to `.env.local`

---

## 🌐 Environment Variables

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=nemu_uploads

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_AUTH_DOMAIN=nemu.com
```

---

## 📦 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
# ... repeat for all env vars
```

Or connect your GitHub repo to Vercel and add environment variables in the Vercel dashboard.

---

## 📱 User Flows

### Restaurant Owner
1. Visit `/register` → Submit restaurant name + phone
2. Wait for admin approval (status: pending)
3. After approval → Login at `/login` with phone number
4. Access dashboard → Add categories, menu items, download QR

### Customer
1. Scan QR code or visit `/menu/[slug]`
2. Browse menu by category
3. Search for specific items
4. No login required

### Super Admin
1. Login at `/admin/login` with email + password
2. Review pending registrations at `/admin/restaurants`
3. Approve → QR code is auto-generated for the restaurant
4. Monitor statistics at `/admin/statistics`

---

## 🗂️ Project Structure

```
app/
├── page.tsx                    # Landing page
├── register/page.tsx           # Owner registration
├── login/page.tsx              # Owner login
├── pending/page.tsx            # Awaiting approval
├── menu/[slug]/                # Public customer menu
├── dashboard/                  # Owner dashboard
│   ├── layout.tsx
│   ├── page.tsx               # Overview
│   ├── categories/page.tsx
│   ├── menu/page.tsx
│   ├── qr/page.tsx
│   └── settings/page.tsx
├── admin/                      # Admin panel
│   ├── login/page.tsx
│   ├── dashboard/page.tsx
│   ├── restaurants/page.tsx
│   └── statistics/page.tsx
└── api/upload/route.ts         # Cloudinary upload endpoint
lib/
├── firebase.ts                 # Firebase init
├── auth.ts                     # Auth helpers + phone→email
├── firestore.ts                # Firestore CRUD
├── cloudinary.ts               # Upload helper
├── qrcode.ts                   # QR generation
├── utils.ts                    # Utilities
└── types/index.ts              # TypeScript types
```

---

## 🔒 Security

- Phone numbers converted to internal emails (`phone@nemu.com`) — never exposed to users
- Passwords are auto-generated and stored in Firestore — owners never see them
- Firestore rules enforce role-based access
- Middleware protects dashboard and admin routes
- Admin login requires separate email/password credentials

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16 | Framework (App Router) |
| React | 19 | UI |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 4 | Styling |
| Firebase Auth | 11 | Authentication |
| Firestore | 11 | Database |
| Cloudinary | — | Image storage |
| Zustand | — | State management |
| React Hook Form | — | Form handling |
| Zod | — | Validation |
| qrcode | — | QR generation |
| html2canvas | — | Print card export |
| Lucide React | — | Icons |
| react-hot-toast | — | Notifications |
