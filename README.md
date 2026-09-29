# ChooseOne 🔥 known as Habitracker

> **One question. Every day. Did you stay away?**  
> A radically minimalist, distraction-free habit tracker built to help you overcome vices, break addictions, and stay accountable to **one** commitment at a time. No social feed. No coach. No lectures.

---

## 📖 Overview

Most habit tracking applications suffer from feature bloat: dozens of simultaneous habits, gamified clutter, social comparison feeds, and overwhelming dashboards.

**ChooseOne** flips the script with a single, unbending principle: **You only do ONE run at a time.**
Whether quitting smoking, drinking, doomscrolling, porn, junk food, or building a personal discipline, ChooseOne gives you a single binary choice every single day:

> *"Stay away from [habit]?"*  
> **[ YES ]** or **[ NO ]**

- **Yes** lights a flame on your calendar, keeps your streak alive, triggers tactile haptic feedback, and plays an uplifting harmonic chime.
- **No** logs the slip honestly, resets your streak counter without shame, and plays a low-frequency grounding tone.
- **Finished runs** are archived in your history, preserving your best streak, total fires, and run timeline.

---

## ✨ Features

- **Single Active Habit Enforcement**: Enforced at both database and UI level. A user can only have one active run (`endedAt: null`). Starting another requires explicitly concluding the previous run.
- **Curated Presets & Custom Habits**: Built-in presets for common vices (Smoking, Drinking, Porn, Masturbation / NoFap, Junk food, Doomscrolling) with custom run goals (7-day *First week*, 21-day *Classic*, 30-day *A month*, 90-day *Hard mode / NoFap mode*, or custom days).
- **Tactile Sound & Haptic Feedback**: Procedurally synthesized WAV audio cues (`yes.wav` chord and `no.wav` drop) paired with platform-native vibration patterns via `expo-haptics` and `expo-audio`.
- **Calendar & Week Strip Visualization**: 
  - Immediate 7-day horizontal strip on the daily screen.
  - Interactive full-month visual poster displaying active flames, clean days, and monthly completion ratios.
- **Milestone Celebrations**: Distinct celebration overlays for lighting your first fire and completing your goal day target.
- **Past Runs History & Archive**: Track lifetime progress across previous runs, including total fires lit, longest streaks achieved, and start/finish dates.
- **Dual Mode (Local Mock / Remote Cloud)**:
  - **Live Mode**: Connects to the Express & MongoDB backend via JWT authentication with automatic user provisioning.
  - **Mock Mode**: Fully offline, zero-backend mode backed by local `AsyncStorage` for rapid prototyping or private offline use.
- **Profile & Avatar Management**: Custom display names and profile image uploads with automatic cloud hosting on Cloudinary.
- **Aesthetic Dark Theme**: Tailored ink-black surfaces (`#070707`), elevated panels (`#141414`), acid lime/ember green accents (`#C6F24A`), and Poppins typography.

---

## 🏗️ Architecture & Tech Stack

```
chooseone/
├── backend/          # Node.js + Express 5 + MongoDB REST API
└── client/           # React Native + Expo SDK 54 mobile application
```

### Frontend (`client/`)
- **Framework**: [React Native](https://reactnative.dev/) (0.81.5) with [Expo](https://expo.dev/) (SDK 54, New Architecture enabled)
- **Routing**: [Expo Router v6](https://docs.expo.dev/router/introduction/) (file-based navigation with typed routes)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (v5) with shallow selectors and instant offline-first hydration
- **Storage**: `@react-native-async-storage/async-storage` & `expo-secure-store`
- **Audio & Haptics**: `expo-audio` & `expo-haptics`
- **Image Handling**: `expo-image-picker` with multipart image uploads
- **Fonts**: `@expo-google-fonts/poppins`

### Backend (`backend/`)
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules) with [tsx](https://github.com/privatenumber/tsx)
- **Server Framework**: [Express 5](https://expressjs.com/)
- **Database & ODM**: [MongoDB](https://www.mongodb.com/) with [Mongoose 9](https://mongoosejs.com/)
- **Authentication**: Stateless JWT (`jsonwebtoken`) + [bcrypt](https://github.com/kelektiv/node.bcrypt.js)
- **File Uploads**: [Multer](https://github.com/expressjs/multer) & [Cloudinary SDK](https://cloudinary.com/)

---

## 📁 Repository Structure

```tree
chooseone/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── Checkin.ts      # Checkin schema (habitId, date, answer: yes|no)
│   │   │   ├── Habit.ts        # Habit schema with partial unique index
│   │   │   └── User.ts         # User schema (email, passwordHash, avatarUri)
│   │   ├── auth.ts             # JWT token signing & verification middleware
│   │   ├── cloudinary.ts       # Cloudinary image upload stream integration
│   │   ├── db.ts               # Database connection logic
│   │   ├── env.ts              # Strongly-typed environment variable loader
│   │   ├── index.ts            # Express server initialization & listener
│   │   ├── migrate.ts          # Index sync & run structure data migration
│   │   ├── routes.ts           # REST API route handlers
│   │   ├── serialize.ts        # Streaks, serialization & date formatting
│   │   └── types.ts            # Backend data types and DTO contracts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── client/
│   ├── app/                    # Expo Router file-based screens
│   │   ├── (app)/              # Authenticated application group
│   │   │   ├── _layout.tsx     # Custom bottom tab navigation
│   │   │   ├── index.tsx       # Redirects to /today
│   │   │   ├── profile.tsx     # Profile, stats, run history, and settings
│   │   │   └── today.tsx       # Daily check-in screen, pad, and week strip
│   │   ├── _layout.tsx         # Root stack layout & AppProvider wrapper
│   │   ├── index.tsx           # Authentication & onboarding routing gate
│   │   ├── landing.tsx         # Welcome splash with action buttons
│   │   ├── login.tsx           # Email & password authentication
│   │   ├── onboarding.tsx      # Multi-step feature walkthrough
│   │   └── pick-habit.tsx      # Habit selector & goal duration setter
│   ├── assets/                 # Icons, splash images, and sound effects
│   │   └── sounds/             # yes.wav and no.wav audio cues
│   ├── scripts/
│   │   └── make-sounds.mjs     # Procedural audio generator script
│   ├── src/
│   │   ├── components/         # Modular UI components (Calendar, YesNoPad, Sheets)
│   │   ├── data/               # API clients (httpHabitApi, mockHabitApi, token cache)
│   │   ├── lib/                # Date helpers, stats, haptics, and habit presets
│   │   ├── state/              # Zustand global store (appStore.ts, AppProvider.tsx)
│   │   └── theme/              # Color palette and typography definitions
│   ├── app.json
│   └── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [pnpm](https://pnpm.io/) (or `npm` / `yarn`)
- [MongoDB](https://www.mongodb.com/) instance (local or MongoDB Atlas)
- [Expo Go](https://expo.dev/go) app on your mobile device (iOS/Android) or an emulator

---

### 1. Backend Setup

1. Open a terminal in the `backend/` directory:
   ```bash
   cd backend
   pnpm install
   ```

2. Create your `.env` configuration:
   ```bash
   cp .env.example .env
   ```

3. Fill in your environment variables in `backend/.env`:
   ```env
   PORT=3000
   MONGODB_URI=mongodb+srv://<USER>:<PASS>@<CLUSTER>.mongodb.net/chooseone
   JWT_SECRET=your_super_secret_jwt_key
   
   # Optional: Cloudinary credentials for avatar photo uploads
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   ```

4. Start the backend development server:
   ```bash
   pnpm dev
   ```
   The server will start at `http://localhost:3000`.

---

### 2. Client (Mobile App) Setup

1. Open a terminal in the `client/` directory:
   ```bash
   cd client
   pnpm install
   ```

2. (Optional) Re-synthesize audio assets:
   ```bash
   node scripts/make-sounds.mjs
   ```

3. Configure your API connection:
   
   Choose your working mode in `client/app.json` (under `expo.extra`) or via environment variables:

   - **Using the Backend API (Default)**:
     Set your backend API URL in `client/app.json`:
     ```json
     "extra": {
       "apiUrl": "http://<YOUR_LOCAL_IP>:3000",
       "useMock": false
     }
     ```
     *(Note: When testing on a physical phone via Expo Go, replace `localhost` with your computer's local Wi-Fi IP address, e.g. `http://192.168.1.50:3000`, or use an ngrok/cloud tunnel).*

   - **Using Fully Offline / Mock Mode**:
     To run the client completely standalone without any backend server:
     ```json
     "extra": {
       "useMock": true
     }
     ```
     Or set the environment variable when launching:
     ```bash
     EXPO_PUBLIC_USE_MOCK=true npx expo start
     ```

4. Start the Expo development server:
   ```bash
   pnpm start
   ```

5. Run on your desired platform:
   - Press `a` for **Android** emulator / device.
   - Press `i` for **iOS** simulator.
   - Press `w` for **Web** preview.
   - Scan the terminal QR code with **Expo Go** on your physical phone.

---

## 🔌 API Reference

All requests with user data require a Bearer token: `Authorization: Bearer <TOKEN>`.

### Authentication & Bootstrap
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/login` | Authenticate or auto-register user by email and password. Returns `{ user, token }`. |
| `POST` | `/logout` | Invalidate / exit session. |
| `GET` | `/session` | Returns current user session or `null` if unauthenticated. |
| `GET` | `/bootstrap` | Initial state load: active habit, checkins, run history, and subscription. |
| `POST` | `/onboarding/complete` | Marks onboarding completed on server. |

### Habits & Runs
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/habit` | Returns the currently active habit run, or `null`. |
| `POST` | `/habit` | Start or update a habit run (`{ name, goalDays, endCurrent?: boolean }`). |
| `GET` | `/history` | Returns list of all concluded past habit runs with streak & fire statistics. |

### Check-ins
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/checkin` | Log daily status (`{ date: "YYYY-MM-DD", answer: "yes" \| "no" }`). |
| `GET` | `/checkins` | Fetch check-ins for the active habit (optional filter: `?month=YYYY-MM`). |

### Profile & Customization
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/profile` | Update profile details (e.g. display name). |
| `POST` | `/profile/avatar` | Upload profile image via multipart `FormData` (stores to Cloudinary). |
| `POST` | `/plus/purchase` | Mock in-app upgrade endpoint. |

---

## 🎨 Design Philosophy & UI System

ChooseOne uses an intentional, hyper-focused aesthetic:

| Token | Value | Purpose |
|---|---|---|
| `colors.bg` | `#070707` | Deep obsidian canvas background |
| `colors.bgRaised` | `#141414` | Elevated cards, buttons, and pad surfaces |
| `colors.ember` | `#C6F24A` | High-energy acid lime/ember accent (fires, active buttons) |
| `colors.cream` | `#FFFFFF` | Primary readable headline text |
| `colors.creamMuted` | `#9A9A9A` | Secondary descriptions and metadata labels |
| `fonts.serifBold` | `Poppins_800ExtraBold` | Bold display typography for key questions & metrics |
| `fonts.sansSemi` | `Poppins_600SemiBold` | Clean, crisp body and interactive labels |

---

## 📄 License

This project is private and maintained for personal habit mastery. All rights reserved.
