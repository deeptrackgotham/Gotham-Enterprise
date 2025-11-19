# 🔗 How to Connect Your MongoDB Project

## Your MongoDB Connection String

I assume you already have a MongoDB project created. Here's exactly how to get the connection string:

### Step 1: Open MongoDB Atlas

Go to: **https://mongodb.com/cloud/atlas**

### Step 2: Navigate to Your Cluster

1. Log in to your account
2. Select your project/organization
3. Click on your cluster

### Step 3: Get Connection String

**Option A: Connection String (Easiest)**
1. Click the **"CONNECT"** button (green)
2. Choose **"Connect Your Application"**
3. Select **"Node.js"** as the driver
4. Select your Node.js version
5. Copy the connection string

**Option B: Direct Connection URL**
If the above doesn't work, look for a section labeled "Connection String" and copy the `mongodb+srv://...` URL

### Step 4: Replace Credentials

The connection string looks like:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
```

**Replace:**
- `username` - Your MongoDB username
- `password` - Your MongoDB password
- Keep everything else as-is

### Step 5: Create .env.local

In your project root directory, create a new file called `.env.local`:

```env
MONGODB_URI=mongodb+srv://your_username:your_password@cluster0.xxxxx.mongodb.net/gotham-enterprise?retryWrites=true&w=majority
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### Step 6: Restart Dev Server

```bash
npm run dev
```

---

## ✅ Common Connection String Formats

### MongoDB Atlas (Cloud)
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database?retryWrites=true&w=majority
```

### MongoDB Community (Local)
```
mongodb://localhost:27017/gotham-enterprise
```

### MongoDB with Authentication (Local)
```
mongodb://username:password@localhost:27017/gotham-enterprise
```

---

## 🆘 Troubleshooting Connection

### Error: "Cannot connect to MongoDB"

**Check 1: Connection String Format**
- Starts with `mongodb://` or `mongodb+srv://`?
- Username and password included?
- Database name included?

**Check 2: IP Whitelist (MongoDB Atlas Only)**
1. Go to Security → Network Access
2. Make sure your IP is whitelisted
3. Or add `0.0.0.0/0` to allow all IPs (dev only)

**Check 3: Username/Password**
- Correct username?
- Correct password?
- Special characters escaped? (@, :, /, etc.)

**Check 4: .env.local File**
- File exists in project root?
- Not in `.gitignore`? (it should be for production)
- Restart dev server after saving

### Error: "MONGODB_URI undefined"
- Make sure `.env.local` exists
- Restart dev server: `npm run dev`
- Check spelling: `MONGODB_URI` (uppercase)

### Error: "Connect timeout"
- Check internet connection
- Check MongoDB cluster is running
- Check IP whitelist in MongoDB Atlas

---

## 📍 Finding Your Details in MongoDB Atlas

### Username & Password
1. Click your cluster
2. Click "Connect"
3. Choose "Connect Your Application"
4. See the credentials in the connection string

### Cluster Details
1. Dashboard shows your cluster name
2. Cluster URL in connection string format

### Database Name
1. Collections tab shows your databases
2. Add custom name in connection string if needed

---

## ✨ Quick Copy-Paste Template

Replace the `[ ]` with your values:

```env
MONGODB_URI=mongodb+srv://[USERNAME]:[PASSWORD]@[CLUSTER].mongodb.net/gotham-enterprise?retryWrites=true&w=majority

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=[YOUR_CLERK_KEY]
CLERK_SECRET_KEY=[YOUR_CLERK_SECRET]
```

---

## 🧪 Verify Connection Works

After adding the connection string:

1. Run: `npm run dev`
2. Go to: `http://localhost:3000`
3. Sign up for an account
4. Check MongoDB Atlas → Collections
5. Should see new user in `users` collection ✅

---

## 📞 Need Help?

### Connection String Still Not Working?
1. Check `.env.local` is in project root
2. Verify username/password
3. Check IP whitelist
4. Restart dev server: `npm run dev`

### Can't Find Connection String in MongoDB Atlas?
1. Go to https://mongodb.com/cloud/atlas
2. Select your cluster
3. Click "Connect" button
4. Choose "Connect Your Application"
5. Copy the Node.js version

### Still Stuck?
- See `GETTING_STARTED_MONGODB.md` for detailed help
- Check `MONGODB_SETUP.md` for technical reference
- See `SETUP_INSTRUCTIONS.md` for complete guide

---

## 🚀 You're Ready!

Once `.env.local` is configured with your `MONGODB_URI`:

```bash
npm run dev
```

Visit `http://localhost:3000` and start testing!

✅ Users will be saved to MongoDB  
✅ Scans will be stored automatically  
✅ History will show real data  
✅ Dashboard will display real credits  

**Happy coding! 🎉**

