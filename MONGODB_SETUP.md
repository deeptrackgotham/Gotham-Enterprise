# MongoDB Setup Guide for Gotham-Enterprise

This guide explains how to integrate MongoDB with the Gotham-Enterprise application.

## What's Been Set Up

✅ **MongoDB Connection** - Mongoose connection pooling  
✅ **Database Models** - User and VerificationResult schemas  
✅ **API Routes** - RESTful endpoints for CRUD operations  
✅ **User Sync** - Automatic sync with Clerk authentication  
✅ **Credit System** - Track and manage user credits  

---

## Installation

### 1. Install Dependencies
All required packages have been installed:
```bash
npm install mongoose
```

### 2. Get MongoDB URI

#### Option A: MongoDB Atlas (Cloud - Recommended)
1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new project and cluster
4. Click "Connect" and get your connection string
5. Format: `mongodb+srv://username:password@cluster.mongodb.net/gotham-enterprise?retryWrites=true&w=majority`

#### Option B: MongoDB Community (Local)
1. Install MongoDB locally
2. Start MongoDB service
3. Connection string: `mongodb://localhost:27017/gotham-enterprise`

### 3. Configure Environment Variables

Create `.env.local` in the project root:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gotham-enterprise?retryWrites=true&w=majority

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Optional
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Replace:
- `username` and `password` with your MongoDB credentials
- Clerk keys with your actual Clerk keys from the dashboard

---

## Database Schema

### User Model (`lib/models/User.ts`)
```typescript
{
  clerkId: String (unique),
  email: String (unique),
  fullName: String,
  imageUrl: String,
  credits: Number (default: 5),
  plan: "trial" | "starter" | "growth" | "enterprise",
  createdAt: Date,
  updatedAt: Date
}
```

### VerificationResult Model (`lib/models/VerificationResult.ts`)
```typescript
{
  userId: String,
  scanId: String (unique),
  fileName: String,
  fileType: "image" | "video" | "audio",
  status: "AUTHENTIC" | "SUSPICIOUS" | "DEEPFAKE",
  confidenceScore: Number (0-100),
  modelsUsed: String[],
  uploadedDate: Date,
  imageUrl: String,
  description: String,
  features: String[],
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints

### Users

**Sync User (POST)**
```
POST /api/users/sync
Body: { email, fullName, imageUrl }
```

**Get User (GET)**
```
GET /api/users/sync
Returns: User document with credits and plan info
```

### Scans

**Create Scan (POST)**
```
POST /api/scans
Body: {
  fileName: String,
  fileType: "image" | "video" | "audio",
  status: "AUTHENTIC" | "SUSPICIOUS" | "DEEPFAKE",
  confidenceScore: Number,
  modelsUsed: String[],
  imageUrl?: String,
  description?: String,
  features?: String[]
}
Response: Created VerificationResult with scanId and automatically deducted credit
```

**Get All Scans (GET)**
```
GET /api/scans
Returns: Array of VerificationResult documents sorted by date
```

### Results

**Get Result (GET)**
```
GET /api/results/[id]
Returns: Specific VerificationResult by scanId
```

**Delete Result (DELETE)**
```
DELETE /api/results/[id]
```

---

## Using the API Client

Helper functions are available in `lib/api.ts`:

```typescript
import { 
  syncUserToDb, 
  fetchScans, 
  createScan, 
  fetchResult, 
  deleteResult 
} from "@/lib/api";

// Sync user (automatic in layout)
await syncUserToDb({ email, fullName, imageUrl });

// Fetch all scans
const scans = await fetchScans();

// Create a scan (deducts 1 credit)
const scan = await createScan({
  fileName: "image.jpg",
  fileType: "image",
  status: "AUTHENTIC",
  confidenceScore: 95,
  modelsUsed: ["ModelA", "ModelB"],
});

// Fetch specific result
const result = await fetchResult(scanId);

// Delete result
await deleteResult(scanId);
```

---

## Key Features

### ✅ Automatic User Sync
When users sign in via Clerk, they're automatically synced to MongoDB with:
- 5 initial credits (trial plan)
- Email, name, and profile image

### ✅ Credit System
- Each scan costs 1 credit
- Credits are deducted on scan creation
- Prevents scanning without credits (402 error)

### ✅ Secure Queries
- All endpoints require Clerk authentication
- Users can only access their own data
- Clerk `userId` is used as primary identifier

### ✅ Indexed Queries
- Optimized for fast retrieval of user's scan history
- Index on `userId` + `createdAt` for efficient sorting

---

## Frontend Integration

### Updated Pages
- **History Page** (`app/history/page.tsx`) - Fetches scans from MongoDB
- **Dashboard** - Ready to display MongoDB statistics
- **Results** - Can be updated to fetch from MongoDB

### User Sync Provider
`components/user-sync-provider.tsx` automatically syncs user on login/logout

---

## Troubleshooting

### Connection Issues
```
Error: "Please define the MONGODB_URI environment variable"
```
→ Add `MONGODB_URI` to `.env.local`

### Authentication Errors
```
Error: "Unauthorized"
```
→ Make sure you're signed in with Clerk
→ Check that Clerk keys are correct in `.env.local`

### Insufficient Credits
```
Error: 402 - "Insufficient credits"
```
→ User needs more credits
→ Purchase credits via pricing page or admin panel

---

## Next Steps

1. ✅ Set up `.env.local` with MongoDB URI
2. ✅ Test user sync by logging in
3. ✅ Create test scans via the history page
4. ⏭️ Update dashboard to show real data from MongoDB
5. ⏭️ Implement file upload to storage (S3, Cloudinary, etc.)
6. ⏭️ Add background jobs for actual verification processing

---

## Production Checklist

- [ ] Use strong MongoDB credentials
- [ ] Enable IP whitelist in MongoDB Atlas
- [ ] Use Vercel environment variables for production
- [ ] Set up backups in MongoDB Atlas
- [ ] Monitor connection pool usage
- [ ] Set up error logging (Sentry, etc.)
- [ ] Test all API endpoints
- [ ] Implement rate limiting
- [ ] Set up logging and monitoring

---

## Support

For issues or questions:
- Check `.env.local` configuration
- Verify MongoDB connection string
- Check Clerk keys and permissions
- Review browser console for errors
- Check server logs for detailed error messages
