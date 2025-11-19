# ⚡ Quick Start - MongoDB Connection

## 🎯 In 3 Steps:

### 1️⃣ Get MongoDB URI
- Go to your MongoDB project
- Copy connection string
- Example: `mongodb+srv://user:pass@cluster.mongodb.net/gotham-enterprise?retryWrites=true&w=majority`

### 2️⃣ Create `.env.local`
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gotham-enterprise?retryWrites=true&w=majority
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret
```

### 3️⃣ Run Project
```bash
npm run dev
```

---

## ✅ That's It!

Visit `http://localhost:3000` and:
1. Sign up
2. Upload a file
3. See results in MongoDB ✨

---

## 📚 Learn More

- See `GETTING_STARTED_MONGODB.md` for detailed setup
- See `MONGODB_SETUP.md` for technical details
- See API endpoints in `GETTING_STARTED_MONGODB.md`

---

## 🧪 Quick Tests

**Test 1: Sign Up**
- Go to `/signup`
- User should appear in MongoDB `users` collection

**Test 2: Upload**
- Go to home page
- Upload file
- Scan result should appear in `verificationresults` collection

**Test 3: History**
- Go to `/history`
- Should see all scans from MongoDB

**Test 4: Dashboard**
- Go to `/dashboard`
- Should show real credit balance and scans

---

## 🆘 Need Help?

If you get errors:
1. Check `.env.local` has correct `MONGODB_URI`
2. Restart dev server: `npm run dev`
3. Check browser console for specific error messages
4. See troubleshooting in `GETTING_STARTED_MONGODB.md`

---

**Ready? Let's go! 🚀**
