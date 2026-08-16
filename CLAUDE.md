# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Careerak is a mentor-student matching/booking web app. It's a two-package repo with no root-level tooling — always `cd` into `backend` or `frontend` before running commands.

- `backend` — Express + Mongoose (MongoDB) REST API
- `frontend` — Vite + React SPA (plain JS/JSX, no TypeScript, no router or state library — view switching is done with local `useState`)

## Commands

Backend (`cd backend`):
- `npm install`
- `npm run dev` — start with nodemon (auto-restart)
- `npm start` — start with plain node
- `node scripts/listUsers.js` — debug script that connects to `MONGO_URI` and dumps the last 50 users

Frontend (`cd frontend`):
- `npm install`
- `npm run dev` — Vite dev server on port 3000, proxies `/api` to `http://localhost:5000` (see `frontend/vite.config.js`)
- `npm run build` — production build
- `npm run start` — preview the production build

There is currently no lint or test tooling configured in either package (no `test`/`lint` scripts in `package.json`, no test files in the repo).

## Environment

Backend reads config from `backend/.env` (gitignored; copy `backend/.env.example`):
- `MONGO_URI` — MongoDB connection string
- `JWT_SECRET` — required for auth; register/login return a 500 if unset
- `CORS_ORIGIN` — comma-separated list of allowed origins (defaults to `http://localhost:3000`)
- `PORT` — API port (defaults to 5000)

Frontend reads `VITE_API_BASE` (optional) to override the API base URL; empty string means requests go through the Vite dev proxy.

## Architecture

**Request flow**: `frontend/src/api.js` is the single fetch layer — every network call in the app goes through its exported functions (`register`, `login`, `createAvailability`, `getMentorAvailability`, `deleteAvailability`, `createBooking`, `getStudentBookings`, `getMentorBookings`, `cancelBooking`). Components never call `fetch` directly.

**Backend layering**: `server.js` mounts three routers under `/api` — `routes/auth.js` (self-contained, no controller file, includes an in-memory per-IP rate limiter), `routes/availability.js`, and `routes/booking.js`. The latter two delegate to `controllers/availabilityController.js` and `controllers/BookingController.js` respectively.

  ⚠️ `routes/booking.js` does `require('../controllers/bookingController')` (lowercase c) but the file on disk is `BookingController.js` (capital B). This only resolves on case-insensitive filesystems (Windows/macOS). It will break with `MODULE_NOT_FOUND` on Linux/case-sensitive filesystems (most CI, Docker, and cloud hosts) — rename the file or fix the require path before deploying to Linux.

**Data model** (Mongoose, all in `backend/models/`):
- `User` — `role` is `'student'` or `'mentor'`; both roles share one collection. Mentors and students are distinguished purely by this field.
- `Availability` — a mentor-owned time slot (`mentorId` ref `User`, `date`/`startTime`/`endTime`, `status: 'available'|'booked'`).
- `Booking` — links a `studentId` to an `availabilityId` (and denormalizes `mentorId` from the availability at creation time), with `status: 'pending'|'confirmed'|'cancelled'|'completed'`.

Booking/cancellation flips the linked `Availability.status` between `available`/`booked` as a side effect (see `createBooking`/`cancelBooking` in `BookingController.js`) — there's no transaction, so the two writes aren't atomic.

**Auth model**: JWT is issued on register/login and stored client-side in `sessionStorage` (`frontend/src/App.jsx`), but no request in `api.js` actually attaches it as an `Authorization` header, and none of the availability/booking routes verify a token or check that the caller owns the `studentId`/`mentorId` they pass in. Treat these endpoints as unauthenticated when reasoning about changes — don't assume request bodies are trustworthy.

**Frontend composition**: `App.jsx` toggles between `Signup`/`Login`/`Dashboard` based on local state (no router). `Dashboard.jsx` branches on `user.role`: mentors get `MentorAvailability` (create/list/delete their own slots), students get `AvailableSlots` (browse a mentor's open slots and book) + `StudentBookings` (list/cancel their own bookings). There is no mentor discovery/matching UI yet — `Dashboard.jsx` currently passes students a hardcoded `testMentorId` placeholder instead of a real mentor list.
