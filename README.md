# Gotham-Enterprise

Enterprise-grade dashboard and verification platform for media authenticity, built on **Next.js**, **Tailwind CSS**, and **Clerk** authentication.

---

## Table of Contents
- [About](#about)  
- [Key Features](#key-features)  
- [Tech Stack](#tech-stack)  
- [Authentication (Clerk)](#authentication-clerk)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Installation](#installation)  
  - [Environment Variables](#environment-variables)  
  - [Running Locally](#running-locally)  
  - [Building & Deployment](#building--deployment)

---

## About

**Gotham-Enterprise** is the enterprise front-end dashboard for the Gotham media-verification ecosystem, designed for scalable teams, high-volume media analysis, and real-time authenticity checks.

It provides:

- A modern **Next.js App Router** architecture  
- Image & URL-based verification flows  
- Mobile-first, vertically stacked sections for clean UX  
- Detailed media history and analytics  
- Real-time verification results  
- Role-based access via **Clerk authentication**  
- A sleek, minimal **dark UI** using Tailwind

---

## Key Features

- Upload **multiple images** or submit **remote URLs** for verification  
- Camera capture **disabled** by default for workflow consistency  
- Vertical mobile layout: **Upload → Results → Quick Stats**  
- Enterprise-grade **Verification History**, including:
  - Image thumbnails  
  - Metadata  
  - Verdict indicators  
  - Confidence progress bars  
  - Filtering + search  
- Semi-transparent, outlined cards & tables for a premium feel  
- Full authentication integration with Clerk  
- Ready for team dashboards and permission-based environments  

---

## Tech Stack

| Category | Technologies |
|---------|--------------|
| Framework | **Next.js (App Router)** |
| Language | **TypeScript** |
| Styling | **Tailwind CSS** |
| UI Library | **shadcn/ui**, **lucide-react** |
| Auth | **Clerk** |
| Deployment | **Vercel** (recommended) or any Next.js-compatible host |

---

## Authentication (Clerk)

Gotham-Enterprise uses **Clerk** for:  
- Sign-in / Sign-up  
- Session management  
- User profile access  
- Route protection  


### Clerk Integration Overview

- `ClerkProvider` is wrapped around the entire application in `layout.tsx`.
- Middleware is configured to protect authenticated routes such as:
  - `/dashboard`
  - `/history`
  - `/verify`
- Components use:
  - `useUser()` to access user data.
  - `useAuth()` to access tokens/session.
  - Clerk UI components like `<SignIn />`, `<SignUp />`, `<UserButton />`.

### Required Clerk Environment Variables

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_key


---

## Getting Started

### Prerequisites
- Node.js 16+  
- npm, yarn, or pnpm  
- Clerk account (for authentication keys)

---

## Installation

```bash
git clone https://github.com/deeptrackgotham/Gotham-Enterprise.git
cd Gotham-Enterprise
npm install 
```
---

### Environment Variables

Create a `.env.local` file in the root directory and include:

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_key


Ensure these match the values generated in your Clerk dashboard and backend API configuration.

---

### Running Locally

Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev

```
