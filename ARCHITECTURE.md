# 🏗️ Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        GOTHAM-ENTERPRISE                         │
│                       Next.js Frontend                           │
└─────────────────────────────────────────────────────────────────┘
                               ↑
                               ↓
         ┌─────────────────────────────────────────┐
         │      Next.js API Routes                 │
         ├─────────────────────────────────────────┤
         │  POST   /api/users/sync        (Clerk)  │
         │  GET    /api/users/sync        (Clerk)  │
         │  POST   /api/scans             (Create) │
         │  GET    /api/scans             (List)   │
         │  GET    /api/results/[id]      (Detail) │
         │  DELETE /api/results/[id]      (Delete) │
         └─────────────────────────────────────────┘
                               ↑
                               ↓
         ┌─────────────────────────────────────────┐
         │      Mongoose ODM Layer                 │
         ├─────────────────────────────────────────┤
         │  lib/db.ts          (Connection)        │
         │  User.ts            (Schema)            │
         │  VerificationResult.ts (Schema)         │
         └─────────────────────────────────────────┘
                               ↑
                               ↓
         ┌─────────────────────────────────────────┐
         │          MongoDB Atlas                  │
         ├─────────────────────────────────────────┤
         │  users collection                       │
         │  verificationresults collection         │
         └─────────────────────────────────────────┘
```

---

## Data Flow: User Signup

```
User visits /signup
    │
    ├─→ Clerk handles registration
    │
    ├─→ Clerk provides user token
    │
    ├─→ Layout renders with UserSyncProvider
    │
    ├─→ UserSyncProvider detects isSignedIn = true
    │
    ├─→ Calls syncUserToDb()
    │       │
    │       └─→ POST /api/users/sync
    │            │
    │            └─→ Create/Update User in MongoDB
    │                 ├─ clerkId
    │                 ├─ email
    │                 ├─ fullName
    │                 ├─ credits = 5
    │                 ├─ plan = "trial"
    │                 └─ timestamps
    │
    └─→ User ready to upload
```

---

## Data Flow: File Upload

```
User selects file on /
    │
    ├─→ handleFileUpload() triggered
    │
    ├─→ Check isSignedIn
    │   ├─ No  → Redirect to /login
    │   └─ Yes → Continue
    │
    ├─→ Create FormData with file
    │
    ├─→ Call createScan()
    │       │
    │       └─→ POST /api/scans
    │            │
    │            ├─→ Server: Verify auth (Clerk)
    │            │
    │            ├─→ Server: Check user credits ≥ 1
    │            │   ├─ No credits → Return 402
    │            │   └─ Has credits → Continue
    │            │
    │            ├─→ Server: Create VerificationResult
    │            │    ├─ scanId (unique)
    │            │    ├─ userId
    │            │    ├─ fileName
    │            │    ├─ fileType
    │            │    ├─ status (mock: AUTHENTIC, SUSPICIOUS, DEEPFAKE)
    │            │    ├─ confidenceScore (mock)
    │            │    └─ timestamps
    │            │
    │            ├─→ Server: Deduct 1 credit from user
    │            │
    │            └─→ Return { scanId, ...data }
    │
    ├─→ Frontend receives scanId
    │
    └─→ router.push(`/results/${scanId}`)
         │
         └─→ Load results page with data
```

---

## Data Flow: View History

```
User visits /history
    │
    ├─→ useEffect triggers on mount
    │
    ├─→ Call fetchScans()
    │       │
    │       └─→ GET /api/scans
    │            │
    │            ├─→ Server: Verify auth (Clerk)
    │            │
    │            ├─→ Server: Get userId from token
    │            │
    │            ├─→ Server: Query MongoDB
    │            │    └─ Find all VerificationResults
    │            │       where userId = current user
    │            │
    │            ├─→ Server: Sort by createdAt DESC
    │            │
    │            └─→ Return [{ ...scan1 }, { ...scan2 }, ...]
    │
    ├─→ Frontend receives scans
    │
    ├─→ Format for display
    │
    └─→ Render in table with filters
         └─ Can filter by status
         └─ Can delete individual scans
```

---

## Data Flow: View Result Detail

```
User clicks on scan in history
    │
    ├─→ Redirects to /results/[scanId]
    │
    ├─→ useEffect triggers with scanId
    │
    ├─→ Call fetchResult(scanId)
    │       │
    │       └─→ GET /api/results/[scanId]
    │            │
    │            ├─→ Server: Verify auth (Clerk)
    │            │
    │            ├─→ Server: Get userId from token
    │            │
    │            ├─→ Server: Query MongoDB
    │            │    └─ Find VerificationResult
    │            │       where scanId = [scanId] AND userId = current
    │            │
    │            ├─→ Return { ...result details }
    │
    ├─→ Frontend receives result
    │
    └─→ Display all scan details
         ├─ File name
         ├─ Status (AUTHENTIC, SUSPICIOUS, DEEPFAKE)
         ├─ Confidence score
         ├─ Models used
         ├─ Upload date
         ├─ Image thumbnail
         └─ Features list
```

---

## Component Tree

```
layout.tsx
├─ ClerkProvider
├─ UserSyncProvider ⭐
│  └─ Auto-syncs user on login
├─ Header
└─ main
   ├─ page.tsx (Home/Upload)
   │  ├─ useFileUpload hook
   │  ├─ handleFileUpload()
   │  ├─ handleUrlSubmit()
   │  └─ Upload UI
   │
   ├─ dashboard/page.tsx
   │  ├─ useEffect fetchScans()
   │  ├─ Real credit balance
   │  ├─ Recent scans list
   │  └─ Chart component
   │
   ├─ history/page.tsx
   │  ├─ useEffect fetchScans()
   │  ├─ Status filters
   │  └─ Scans table
   │
   └─ results/[id]/page.tsx
      ├─ useEffect fetchResult()
      ├─ Result display
      └─ Detail sections
```

---

## Database Query Paths

```
INSERT User (on signup)
├─ Clerk provides user data
├─ POST /api/users/sync
├─ MongoDB create in users collection
└─ Generate _id, timestamps

INSERT Scan (on upload)
├─ Frontend sends scan data
├─ POST /api/scans
├─ Check user credits
├─ MongoDB create in verificationresults
├─ Deduct credit from users
└─ Return scanId

SELECT Scans (on /history)
├─ Frontend requests
├─ GET /api/scans
├─ MongoDB query where userId = X
├─ Sort by createdAt DESC
└─ Return array

SELECT Result (on /results/[id])
├─ Frontend requests with scanId
├─ GET /api/results/[id]
├─ MongoDB find where scanId = X AND userId = Y
└─ Return single document

DELETE Result (on history delete)
├─ Frontend requests with scanId
├─ DELETE /api/results/[id]
├─ MongoDB delete where scanId = X AND userId = Y
└─ Return success
```

---

## Authentication Flow

```
User → Clerk Login
    │
    └─→ Clerk generates JWT token
         │
         └─→ Token stored in browser
              │
              └─→ Every API request includes token
                   │
                   └─→ Next.js auth() validates token
                        │
                        ├─ Valid → Extract userId
                        │
                        └─ Invalid → Return 401
```

---

## Credit System

```
User Signs Up
    │
    └─→ credits = 5 (trial)

User Uploads File
    │
    └─→ POST /api/scans
         │
         ├─→ Check credits ≥ 1
         │
         ├─→ Create scan in MongoDB
         │
         ├─→ Deduct 1 credit
         │
         └─→ Save user with credits = 4

Loop for each scan:
    ├─ User can create max 5 scans (trial)
    ├─ After 5 scans: credits = 0
    ├─ Cannot scan without credits (402 error)
    └─ User must upgrade plan or buy credits
```

---

## API Request/Response Cycle

```
Frontend Request
    │
    ├─→ fetch('/api/scans', options)
    │
    ├─→ Next.js API Route receives request
    │
    ├─→ route.ts handler function
    │   ├─ const { userId } = await auth()
    │   ├─ Validate authentication
    │   ├─ Connect to MongoDB
    │   ├─ Query/Create/Update/Delete
    │   ├─ Handle errors
    │   └─ Return NextResponse
    │
    ├─→ Frontend receives response
    │
    ├─→ Frontend state updated
    │
    └─→ Components re-render
```

---

## Error Handling

```
Error Location: API Route
    │
    ├─→ Catch error
    │   ├─ console.error() for debugging
    │   └─ NextResponse with status
    │
    ├─→ Return to frontend
    │   ├─ 401: Unauthorized (not logged in)
    │   ├─ 402: Insufficient credits
    │   ├─ 404: Not found
    │   ├─ 500: Server error
    │   └─ Message included
    │
    └─→ Frontend handles
        ├─ Redirect to login if 401
        ├─ Show error message
        ├─ Log to console
        └─ User sees message
```

---

## Deployment Architecture

```
Development
├─ localhost:3000
├─ .env.local (local MongoDB or Atlas)
└─ npm run dev

Production (Vercel)
├─ vercel.com/your-app
├─ Environment variables
│  ├─ MONGODB_URI (Atlas)
│  ├─ CLERK_SECRET_KEY
│  └─ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
├─ Auto-deployment on git push
└─ HTTPS enabled
```

---

## File Organization

```
Gotham-Enterprise/
├─ app/
│  ├─ api/
│  │  ├─ users/sync/route.ts        🔹 User sync
│  │  ├─ scans/route.ts              🔹 Scans CRUD
│  │  └─ results/[id]/route.ts       🔹 Results CRUD
│  │
│  ├─ page.tsx                       🔹 Upload page
│  ├─ dashboard/page.tsx             🔹 Dashboard
│  ├─ history/page.tsx               🔹 History
│  ├─ results/[id]/page.tsx          🔹 Result detail
│  └─ layout.tsx                     🔹 Root layout
│
├─ lib/
│  ├─ db.ts                          🔹 MongoDB connection
│  ├─ api.ts                         🔹 API helpers
│  └─ models/
│     ├─ User.ts                     🔹 User schema
│     └─ VerificationResult.ts       🔹 Result schema
│
├─ components/
│  ├─ user-sync-provider.tsx         🔹 Auto-sync
│  └─ ui/                            🔹 UI components
│
└─ .env.local                        🔹 Config (git ignored)
```

---

This architecture ensures:
- ✅ Separation of concerns
- ✅ Security (auth validation on every request)
- ✅ Scalability (indexed MongoDB queries)
- ✅ Maintainability (clear file structure)
- ✅ Performance (connection pooling)

