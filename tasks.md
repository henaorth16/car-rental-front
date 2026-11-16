# 🚗 Car Rental Platform — MVP & Production Roadmap

## 📌 Project Overview & Current Architecture
The project is organized as a full-stack monorepo:
- **Backend (`car_rent_app`)**: Node.js/TypeScript, Express 5, Prisma ORM, SQLite (`better-sqlite3`), Better Auth with cookie-based session management, Polar SDK for checkout/payments, Multer for vehicle photo uploads (`/uploads/cars`), Winston logger, and Swagger OpenAPI (`/api-docs`).
- **Frontend (`car_rent_fe`)**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui components, TanStack Query v5, Axios (`withCredentials: true`), React Hook Form, Better Auth React client, Framer Motion.

---

## 🎯 MVP Objective
> **Primary Goal**: Deliver a seamless, production-ready car rental experience where a customer can:
> 1. Browse and filter available vehicles with detailed specifications and pricing.
> 2. Authenticate securely (Sign Up / Sign In).
> 3. Select rental dates and book a vehicle with conflict prevention.
> 4. Pay via checkout flow and receive instant confirmation.
> 5. View their active and past bookings with the ability to cancel pending reservations.
>
> **Secondary (Operational) Goal**: Enable fleet managers (Agents / Admins) to manage inventory (add/edit/delete cars with images), view all incoming bookings, and monitor payments.

---

## 📋 Comprehensive Tasks List (`tasks.md`)

### Phase 1: Critical Fixes & Core MVP Alignment
- [x] **1.1 Fix Car Details Page Runtime Crash (`car_rent_fe/src/app/cars/[id]/page.tsx`)**
  - Fix unsafe array access `const currentImage = images[activeImageIndex].url;` which crashes when `images` is empty (`car.images` is empty/undefined).
  - Use optional chaining and fallback placeholder icon: `images[activeImageIndex]?.url`.
- [x] **1.2 Fix Fast Checkout Redirect Disconnect (`FastCheckOutButton.tsx`)**
  - Align backend response structure `{ result: { url: ... } }` with frontend expectation (`data?.result?.url || data?.url`).
  - Redirect users correctly to the checkout URL instead of triggering false local success.
- [x] **1.3 Fix Prisma Relations for Booking Cars (`car_rent_app/src/modules/bookings/bookingController.ts`)**
  - Update `getMyBookings` and `getAgentBookings` to include `car: { include: { images: true } }`.
  - Ensure vehicle images appear in the customer's `/bookings` card UI.
- [x] **1.4 Implement Booking Cancellation in UI (`car_rent_fe/src/app/(dashboard)/bookings/page.tsx`)**
  - Add a "Cancel Booking" action button on pending bookings.
  - Wire to `DELETE /api/bookings/:id` with TanStack Query mutation and query invalidation.
- [x] **1.5 Fix Admin Dashboard Multi-Fetch Bug (`car_rent_fe/src/app/(dashboard)/admin/page.tsx`)**
  - Fix copy-pasted endpoints in `useQuery`: fetch bookings from `/api/bookings/agent` (not `/api/users`), payments from `/api/payments` (not `/api/users`), and unpack responses (`data?.bookings`, `data?.payments`, `data?.users`).

---

### Phase 2: Fleet Discovery & Filtering Experience
- [x] **2.1 Fleet Filter & Search Bar (`car_rent_fe/src/app/cars/page.tsx`)**
  - Add search input for brand, model, and vehicle type.
  - Add category filter pills (Sedan, SUV, Luxury, Electric, Hatchback).
  - Add fuel type (`PETROL`, `DIESEL`, `ELECTRIC`, `HYBRID`) and transmission (`AUTOMATIC`, `MANUAL`) filters.
  - Add price range slider or min/max price inputs.
  - Pass filter parameters to backend `GET /api/cars` with query params.
- [x] **2.2 Pagination & Sort Controls**
  - Implement pagination controls (Previous / Next / Page Numbers) using backend pagination metadata.
  - Add sorting dropdown (Price: Low to High, Price: High to Low, Newest).
- [x] **2.3 Enhanced Empty & Loading States**
  - Improve skeleton loaders for car cards.
  - Add "Clear filters" button when no vehicles match query.

---

### Phase 3: Booking Engine & Payment Flow
- [x] **3.1 Dynamic Price Calculation on Booking Form (`car_rent_fe/src/app/(dashboard)/bookings/new/page.tsx`)**
  - Calculate total rental days and total estimated cost in real-time as start and drop-off dates are chosen.
  - Enforce minimum booking duration of 1 day.
  - Validate date overlap and display human-readable error messages if vehicle is already reserved.
- [x] **3.2 Robust Payment Checkout & Webhook Fallback**
  - Support Polar checkout in sandbox/production with `POLAR_WEBHOOK_SECRET`.
  - Provide development/demo mode payment confirmation endpoint or auto-verification when Polar sandbox redirects to `/success?checkout_id=...`.
  - On `/success` page: extract `bookingId` or `checkout_id`, verify payment status, update booking status to `CONFIRMED`, and display confirmation card.
- [x] **3.3 Rental Agreement & Status Indicators**
  - Add status badge badges: `PENDING` (yellow), `CONFIRMED` (emerald), `CANCELLED` (red), `COMPLETED` (blue).
  - Display rental summary (dates, vehicle specs, pickup instructions).

---

### Phase 4: User Authentication & Profile
- [x] **4.1 Complete Customer Profile Page (`car_rent_fe/src/app/(dashboard)/profile/page.tsx`)**
  - Replace placeholder stub with profile dashboard showing User Name, Email, Phone number, and Role.
  - Include quick links to "My Bookings" and "Become an Agent".
  - Allow updating basic contact details (phone number, address).
- [x] **4.2 Agent Portal Registration Flow**
  - Update `/management/register` to automatically guide users through business profile creation (`BecomeAgentForm`) or elevate them to `AGENT` role upon registration.
  - Ensure `ManagementGuard` handles pending session state smoothly without premature redirects.
- [x] **4.3 Route Protection & Auth Modals**
  - Protect `/bookings` and `/bookings/new` by redirecting unauthenticated users to `/login?callbackURL=...`.
  - Add visual feedback (toasts) for login, logout, and registration actions.

---

### Phase 5: Fleet & Operations Management (Admin/Agent)
- [x] **5.1 Management Bookings View (`car_rent_fe/src/app/(dashboard)/admin/bookings/page.tsx`)**
  - Replace stub with a data table/cards showing all car reservations.
  - Display customer name, contact, car booked, dates, payment status, and actions.
  - Allow agents/admins to approve or mark bookings as completed.
- [x] **5.2 Management Users / Customers View (`car_rent_fe/src/app/(dashboard)/admin/users/page.tsx`)**
  - Replace stub with customer list fetched from `GET /api/users`.
  - Display customer name, email, role, and joined date.
- [x] **5.3 Inventory Management Polish (`/admin/cars`)**
  - Verify Add Car (`/admin/cars/new`) and Edit Car (`/admin/cars/edit/[id]`).
  - Support multi-image upload preview and removal.
  - Add toggle for instant "Available / Unavailable" status update.

---

### Phase 6: Quality, Polish & Launch Readiness
- [x] **6.1 Unified Toast Notifications**
  - Integrate a toast provider (`sonner`) across both customer and management flows for action feedback (booking created, car added, payment initiated, errors).
- [x] **6.2 Database Seeding**
  - Expand seed script to populate realistic sample fleet (multiple vehicle classes: Sedan, SUV, Luxury, Electric) with real specifications and uploaded photos.
  - Provide default test accounts:
    - Customer: `user@example.com` / `password123`
    - Agent: `agent@example.com` / `password123`
    - Admin: `admin@example.com` / `pass@123`
- [x] **6.3 End-to-End Automated & Manual Testing**
  - Update `test_api.ts` to spin up or connect reliably.
  - Verify customer booking flow end-to-end: Register -> Browse Fleet -> View Details -> Book -> Checkout -> View Booking -> Cancel.
- [x] **6.4 Mobile Responsiveness & UI Audit**
  - Verify layout on mobile viewports (Navbar drawer, Car details responsive columns, Booking form cards).
